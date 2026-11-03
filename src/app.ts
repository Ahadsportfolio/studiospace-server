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

const app: Application = express();

// Enable CORS for client with credentials
app.use(
  cors({
    origin: env.CLIENT_URL,
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

// 404 handler for unmatched routes
app.use(notFoundHandler);

// Central JSON error handler
app.use(errorHandler);

export default app;

