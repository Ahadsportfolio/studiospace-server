import app from "./app";
import { env } from "./config/env";
import { connectDB, closeDB, getStudiosCollection } from "./config/db";
import { seedStudios } from "./seed/studios.seed";
import { seedTestAuth } from "./seed/seedTestAuth";

async function bootstrap() {
  try {
    await connectDB();

    // Auto-seed studios if empty (convenience for fresh installs/deployments)
    const studiosCount = await getStudiosCollection().countDocuments();
    if (studiosCount === 0) {
      console.log("[Bootstrap] Studios collection is empty. Seeding initial 12 studios...");
      await seedStudios();
    }

    // Seed test auth session in development for testing endpoints
    if (env.NODE_ENV === "development") {
      await seedTestAuth();
    }
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

export default app;

