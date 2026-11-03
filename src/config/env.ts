import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const requiredEnvVars = [
  "PORT",
  "MONGODB_URI",
  "DB_NAME",
  "JWT_SECRET",
  "CLIENT_URL",
  "NODE_ENV"
] as const;

type RequiredEnvVar = (typeof requiredEnvVars)[number];

const missingVars: RequiredEnvVar[] = [];

for (const key of requiredEnvVars) {
  const value = process.env[key];
  if (!value || value.trim() === "") {
    missingVars.push(key);
  }
}

if (missingVars.length > 0) {
  console.error("================================================================");
  console.error("FATAL ERROR: Missing required environment variable(s):");
  missingVars.forEach((v) => console.error(`  - ${v}`));
  console.error("Please specify all required variables in your server/.env file.");
  console.error("================================================================");
  process.exit(1);
}

const parsedPort = parseInt(process.env.PORT as string, 10);
if (isNaN(parsedPort) || parsedPort <= 0) {
  console.error("================================================================");
  console.error("FATAL ERROR: PORT must be a valid positive integer number.");
  console.error("================================================================");
  process.exit(1);
}

export const env = {
  PORT: parsedPort,
  MONGODB_URI: process.env.MONGODB_URI as string,
  DB_NAME: process.env.DB_NAME as string,
  JWT_SECRET: process.env.JWT_SECRET as string,
  CLIENT_URL: process.env.CLIENT_URL as string,
  NODE_ENV: process.env.NODE_ENV as string,
  SEED_OWNER_EMAIL: process.env.SEED_OWNER_EMAIL || "host@example.com"
} as const;
