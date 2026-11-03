import { MongoClient, Db, Collection } from "mongodb";
import { env } from "./env";
import { StudioDocument, BookingDocument, WishlistDocument } from "../types";

let client: MongoClient | null = null;
let db: Db | null = null;

export async function createIndexes(database: Db): Promise<void> {
  // 1. studios collection indexes (PRD.md: ownerEmail, category, text(title,location), createdAt desc)
  const studios = database.collection<StudioDocument>("studios");
  await studios.createIndex({ ownerEmail: 1 }, { name: "idx_studios_ownerEmail" });
  await studios.createIndex({ category: 1 }, { name: "idx_studios_category" });
  await studios.createIndex(
    { title: "text", location: "text" },
    { name: "idx_studios_text_search" }
  );
  await studios.createIndex({ createdAt: -1 }, { name: "idx_studios_createdAt_desc" });

  // 2. bookings collection indexes (PRD.md: (studioId,status,startAt,endAt), userEmail, hostEmail)
  const bookings = database.collection<BookingDocument>("bookings");
  await bookings.createIndex(
    { studioId: 1, status: 1, startAt: 1, endAt: 1 },
    { name: "idx_bookings_overlap_lookup" }
  );
  await bookings.createIndex({ userEmail: 1 }, { name: "idx_bookings_userEmail" });
  await bookings.createIndex({ hostEmail: 1 }, { name: "idx_bookings_hostEmail" });

  // 3. wishlists collection indexes (PRD.md: unique (userEmail, studioId))
  const wishlists = database.collection<WishlistDocument>("wishlists");
  await wishlists.createIndex(
    { userEmail: 1, studioId: 1 },
    { unique: true, name: "idx_wishlists_user_studio_unique" }
  );

  console.log("[Database] All collection indexes verified/created successfully.");
}

export async function connectDB(): Promise<Db> {
  if (db && client) {
    return db;
  }

  try {
    client = new MongoClient(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    await client.connect();
    db = client.db(env.DB_NAME);
    console.log(`[Database] Connected successfully to MongoDB database: ${env.DB_NAME}`);

    await createIndexes(db);
    return db;
  } catch (error) {
    console.error(`[Database] Connection error: ${(error as Error).message}`);
    throw error;
  }
}

export function isDbConnected(): boolean {
  return db !== null;
}

export function getClient(): MongoClient {
  if (!client) {
    throw new Error("MongoClient is not initialized. Call connectDB() first.");
  }
  return client;
}

export function getDB(): Db {
  if (!db) {
    throw new Error("Database is not connected. Call connectDB() first.");
  }
  return db;
}

export function getStudiosCollection(): Collection<StudioDocument> {
  return getDB().collection<StudioDocument>("studios");
}

export function getBookingsCollection(): Collection<BookingDocument> {
  return getDB().collection<BookingDocument>("bookings");
}

export function getWishlistsCollection(): Collection<WishlistDocument> {
  return getDB().collection<WishlistDocument>("wishlists");
}

export async function closeDB(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log("[Database] MongoDB connection closed.");
  }
}

