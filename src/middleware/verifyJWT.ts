import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { JwtUserPayload } from "../types";

export function verifyJWT(req: Request, res: Response, next: NextFunction): void {
  let token: string | undefined = req.cookies?.token;

  if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtUserPayload;
    if (!decoded || !decoded.email) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    req.user = {
      email: decoded.email,
      name: decoded.name,
      photo: decoded.photo || ""
    };

    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
}

