import { Request, Response, NextFunction } from "express";
import { env } from "../config/env";

export interface ApiError extends Error {
  statusCode?: number;
  status?: number;
}

export function errorHandler(
  err: ApiError,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || "An unexpected server error occurred";

  if (statusCode >= 500) {
    console.error("[ServerError]", err);
  }

  res.status(statusCode).json({
    message,
    ...(env.NODE_ENV === "development" ? { stack: err.stack } : {})
  });
}

