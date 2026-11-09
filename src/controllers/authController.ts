import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { getDB } from "../config/db";
import { env } from "../config/env";
import { JwtUserPayload, BetterAuthSessionDocument, BetterAuthUserDocument } from "../types";

export const authCookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: (env.NODE_ENV === "production" ? "none" : "lax") as "none" | "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  path: "/"
};

/**
 * POST /api/auth/jwt
 * Verifies a BetterAuth session token against MongoDB and issues our HTTPOnly JWT cookie.
 * Rejects bare { email } bodies to prevent unauthorized token minting.
 */
export async function createAuthJwt(req: Request, res: Response): Promise<void> {
  try {
    let sessionToken: string | undefined =
      req.body?.sessionToken ||
      req.body?.token;

    if (!sessionToken && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      sessionToken = req.headers.authorization.split(" ")[1];
    }

    if (!sessionToken && req.cookies) {
      sessionToken = req.cookies["better-auth.session_token"] || req.cookies["better_auth_session_token"];
    }

    // Explicitly reject requests without a session token (e.g. bare { email } body)
    if (!sessionToken || typeof sessionToken !== "string" || sessionToken.trim() === "") {
      res.status(401).json({ message: "Session token is required to issue authentication JWT" });
      return;
    }

    const db = getDB();
    const now = new Date();

    // 1. Look up active session in 'session' (or fallback 'sessions') collection
    let session = await db.collection<BetterAuthSessionDocument>("session").findOne({
      token: sessionToken,
      expiresAt: { $gt: now }
    });

    if (!session) {
      session = await db.collection<BetterAuthSessionDocument>("sessions").findOne({
        token: sessionToken,
        expiresAt: { $gt: now }
      });
    }

    if (!session) {
      res.status(401).json({ message: "Invalid or expired session" });
      return;
    }

    // 2. Look up user by session.userId (supporting string ID or ObjectId)
    const userId = session.userId;
    let user: BetterAuthUserDocument | null = null;

    if (ObjectId.isValid(userId)) {
      user = await db.collection<BetterAuthUserDocument>("user").findOne({ _id: new ObjectId(userId) });
      if (!user) {
        user = await db.collection<BetterAuthUserDocument>("users").findOne({ _id: new ObjectId(userId) });
      }
    }

    if (!user) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      user = await db.collection<BetterAuthUserDocument>("user").findOne({ _id: userId as any });
    }

    if (!user) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      user = await db.collection<BetterAuthUserDocument>("users").findOne({ _id: userId as any });
    }

    if (!user || !user.email) {
      res.status(401).json({ message: "User account not found for session" });
      return;
    }

    // 3. Create JWT payload from verified database record
    const payload: JwtUserPayload = {
      email: user.email,
      name: user.name || "StudioSpace User",
      photo: user.image || ""
    };

    // 4. Sign JWT for 7 days
    const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: "7d" });

    // 5. Set HTTPOnly cookie with required security options
    res.cookie("token", token, authCookieOptions);

    res.status(200).json({
      success: true,
      token,
      user: payload
    });
  } catch (error) {
    res.status(500).json({ message: `Authentication error: ${(error as Error).message}` });
  }
}

/**
 * POST /api/auth/logout
 * Clears the HTTPOnly cookie with identical options.
 */
export async function logout(_req: Request, res: Response): Promise<void> {
  res.clearCookie("token", {
    httpOnly: authCookieOptions.httpOnly,
    secure: authCookieOptions.secure,
    sameSite: authCookieOptions.sameSite,
    path: authCookieOptions.path
  });

  res.status(200).json({ message: "Logged out successfully" });
}

/**
 * GET /api/auth/me
 * Returns the currently authenticated user's profile from verified JWT.
 */
export async function getMe(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  res.status(200).json({ user: req.user });
}

