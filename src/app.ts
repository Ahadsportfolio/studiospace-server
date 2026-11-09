import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import { isDbConnected } from "./config/db";
import { notFoundHandler } from "./middleware/notFound";
import { errorHandler } from "./middleware/errorHandler";
import studioRouter from "./routes/studioRoutes";
import authRouter from "./routes/authRoutes";
import bookingRouter from "./routes/bookingRoutes";
import wishlistRouter from "./routes/wishlistRoutes";

const app: Application = express();

// Parse configured origins (strip trailing slashes, support comma-separated list)
const configuredOrigins = (env.CLIENT_URL || "")
  .split(",")
  .map((url) => url.trim().replace(/\/+$/, ""))
  .filter(Boolean);

const isOriginAllowed = (origin: string | undefined): boolean => {
  // Allow non-browser requests (e.g. mobile apps, curl, server-to-server)
  if (!origin) return true;

  const normalized = origin.trim().replace(/\/+$/, "");

  // Match explicitly configured client origins
  if (configuredOrigins.includes(normalized)) return true;

  // Match localhost and 127.0.0.1 on any port for local development
  if (/^http:\/\/localhost(:\d+)?$/.test(normalized)) return true;
  if (/^http:\/\/127\.0\.0\.1(:\d+)?$/.test(normalized)) return true;

  // Match Vercel preview and production deployments (*.vercel.app)
  if (/^https:\/\/[a-zA-Z0-9_-]+\.vercel\.app$/i.test(normalized)) return true;

  return false;
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true
  })
);

// Body parsers and cookie parser
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    db: isDbConnected() ? "connected" : "disconnected",
    timestamp: new Date().toISOString()
  });
});

// Studio Routes
app.use("/api/studios", studioRouter);

// Auth Routes
app.use("/api/auth", authRouter);

// Booking Routes
app.use("/api/bookings", bookingRouter);

// Wishlist Routes
app.use("/api/wishlist", wishlistRouter);

// 404 handler for unmatched routes
app.use(notFoundHandler);

// Central JSON error handler
app.use(errorHandler);

export default app;

