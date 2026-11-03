import app from "./app";
import { env } from "./config/env";
import { connectDB, closeDB } from "./config/db";

async function bootstrap() {
  try {
    await connectDB();
  } catch (err) {
    console.error(
      "[Bootstrap] Warning: Initial MongoDB connection failed:",
      (err as Error).message
    );
    console.error(
      "[Bootstrap] Please ensure MONGODB_URI is configured with valid credentials and network access is allowed."
    );
  }

  const server = app.listen(env.PORT, () => {
    console.log(`[Server] StudioSpace API running on http://localhost:${env.PORT}`);
    console.log(`[Server] Environment: ${env.NODE_ENV}`);
    console.log(`[Server] Allowed CORS Origin: ${env.CLIENT_URL}`);
  });

  const handleShutdown = async (signal: string) => {
    console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      await closeDB();
      console.log("[Server] Closed HTTP server.");
      process.exit(0);
    });
  };

  process.on("SIGINT", () => handleShutdown("SIGINT"));
  process.on("SIGTERM", () => handleShutdown("SIGTERM"));
}

bootstrap().catch((error) => {
  console.error("[Bootstrap] Fatal startup error:", error);
  process.exit(1);
});

