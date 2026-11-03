import { getDB } from "../config/db";

export const TEST_USER_ID = "test-user-b14a8";
export const TEST_SESSION_TOKEN = "betterauth-session-test-token-xyz123";
export const TEST_USER_EMAIL = "elena.creator@studiospace.com";
export const TEST_USER_NAME = "Elena Rostova";
export const TEST_USER_PHOTO = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200";

export const TEST_HOST_ID = "test-host-marcus-b14a8";
export const TEST_HOST_SESSION_TOKEN = "betterauth-session-host-token-xyz456";
export const TEST_HOST_EMAIL = "marcus.studios@example.com";
export const TEST_HOST_NAME = "Marcus Vance";
export const TEST_HOST_PHOTO = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200";

export async function seedTestAuth(): Promise<void> {
  const db = getDB();

  // Upsert test user 1 (Elena) in 'user' collection
  await db.collection("user").updateOne(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { _id: TEST_USER_ID as any },
    {
      $set: {
        name: TEST_USER_NAME,
        email: TEST_USER_EMAIL,
        image: TEST_USER_PHOTO,
        emailVerified: true,
        updatedAt: new Date()
      },
      $setOnInsert: {
        createdAt: new Date()
      }
    },
    { upsert: true }
  );

  // Upsert test active session for Elena in 'session' collection
  await db.collection("session").updateOne(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { _id: "test-session-id-12345" as any },
    {
      $set: {
        userId: TEST_USER_ID,
        token: TEST_SESSION_TOKEN,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days in future
        updatedAt: new Date()
      },
      $setOnInsert: {
        createdAt: new Date()
      }
    },
    { upsert: true }
  );

  // Upsert test user 2 (Marcus Vance - Host) in 'user' collection
  await db.collection("user").updateOne(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { _id: TEST_HOST_ID as any },
    {
      $set: {
        name: TEST_HOST_NAME,
        email: TEST_HOST_EMAIL,
        image: TEST_HOST_PHOTO,
        emailVerified: true,
        updatedAt: new Date()
      },
      $setOnInsert: {
        createdAt: new Date()
      }
    },
    { upsert: true }
  );

  // Upsert test active session for Marcus in 'session' collection
  await db.collection("session").updateOne(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { _id: "test-session-id-marcus-67890" as any },
    {
      $set: {
        userId: TEST_HOST_ID,
        token: TEST_HOST_SESSION_TOKEN,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      },
      $setOnInsert: {
        createdAt: new Date()
      }
    },
    { upsert: true }
  );

  console.log("[Seed] Test auth users and sessions initialized in MongoDB.");
}
