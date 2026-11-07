import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import http from "http";
import app from "../app.js";
import { env } from "../config/env.js";
import { connectDB, closeDB, getStudiosCollection, getWishlistsCollection } from "../config/db.js";
import { StudioDocument } from "../types/index.js";

async function runWishlistTests() {
  console.log("=== RUNNING WISHLIST ENDPOINT VERIFICATION ===\n");

  await connectDB();
  const studios = getStudiosCollection();
  const wishlists = getWishlistsCollection();

  // Clean test data
  const testUserEmail = "wishlist.tester@studiospace.com";
  await wishlists.deleteMany({ userEmail: testUserEmail });

  // Create a test studio
  const testStudio: StudioDocument = {
    title: "Wishlist Spotlight Stage",
    category: "Film Stage",
    hourlyRate: 175,
    securityDeposit: 350,
    maxCapacity: 25,
    location: "450 Creative Ave, Brooklyn, NY",
    city: "New York",
    image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04",
    gallery: [
      "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04",
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819"
    ],
    amenities: ["Lighting Grid", "Green Screen", "Dressing Room"],
    overview: "A professional film stage designed for seamless video productions and creator shoots.",
    rating: 4.9,
    reviewCount: 14,
    reviews: [],
    ownerEmail: "host.filmmaker@studiospace.com",
    ownerName: "Stage Master",
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const insertResult = await studios.insertOne(testStudio);
  const studioId = insertResult.insertedId.toString();
  console.log(`[Setup] Created test studio with ID: ${studioId}`);

  // Create test JWT token
  const token = jwt.sign(
    { email: testUserEmail, name: "Wishlist Tester" },
    env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  // Start HTTP server on dynamic port
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, () => resolve()));
  const address = server.address() as { port: number };
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    // 1. Unauthenticated GET /api/wishlist -> 401
    const res1 = await fetch(`${baseUrl}/api/wishlist`);
    console.log(`[Test 1] Unauthenticated GET /api/wishlist -> Status: ${res1.status} (Expected: 401)`);
    if (res1.status !== 401) throw new Error("Expected 401 for unauthenticated GET");

    // 2. Unauthenticated POST /api/wishlist/:id -> 401
    const res2 = await fetch(`${baseUrl}/api/wishlist/${studioId}`, { method: "POST" });
    console.log(`[Test 2] Unauthenticated POST /api/wishlist/:id -> Status: ${res2.status} (Expected: 401)`);
    if (res2.status !== 401) throw new Error("Expected 401 for unauthenticated POST");

    // 3. Authenticated POST /api/wishlist/invalid-id -> 400
    const res3 = await fetch(`${baseUrl}/api/wishlist/bad-id-123`, {
      method: "POST",
      headers: { Cookie: `token=${token}` }
    });
    console.log(`[Test 3] Invalid ID POST /api/wishlist/bad-id-123 -> Status: ${res3.status} (Expected: 400)`);
    if (res3.status !== 400) throw new Error("Expected 400 for invalid studio ID");

    // 4. Authenticated POST /api/wishlist/nonexistent -> 404
    const fakeId = new ObjectId().toString();
    const res4 = await fetch(`${baseUrl}/api/wishlist/${fakeId}`, {
      method: "POST",
      headers: { Cookie: `token=${token}` }
    });
    console.log(`[Test 4] Nonexistent studio POST -> Status: ${res4.status} (Expected: 404)`);
    if (res4.status !== 404) throw new Error("Expected 404 for nonexistent studio");

    // 5. Authenticated POST /api/wishlist/:studioId (toggle on -> saved: true)
    const res5 = await fetch(`${baseUrl}/api/wishlist/${studioId}`, {
      method: "POST",
      headers: { Cookie: `token=${token}` }
    });
    const body5 = await res5.json() as { message: string; saved: boolean; studioId: string };
    console.log(`[Test 5] Toggle ON POST /api/wishlist/${studioId} -> Status: ${res5.status}, saved: ${body5.saved}, msg: "${body5.message}"`);
    if (res5.status !== 200 || body5.saved !== true) throw new Error("Expected saved: true on initial toggle");

    // 6. Authenticated GET /api/wishlist -> returns 1 studio with matching id and title
    const res6 = await fetch(`${baseUrl}/api/wishlist`, {
      headers: { Cookie: `token=${token}` }
    });
    const body6 = await res6.json() as Array<{ _id: string; title: string; category: string }>;
    console.log(`[Test 6] GET /api/wishlist -> Status: ${res6.status}, items: ${body6.length}`);
    if (res6.status !== 200 || !Array.isArray(body6) || body6.length !== 1 || body6[0].title !== testStudio.title) {
      throw new Error(`Expected array with 1 studio matching "${testStudio.title}"`);
    }
    console.log(`         Saved Studio: "${body6[0].title}" (${body6[0].category})`);

    // 7. Authenticated POST /api/wishlist/:studioId (toggle off -> saved: false)
    const res7 = await fetch(`${baseUrl}/api/wishlist/${studioId}`, {
      method: "POST",
      headers: { Cookie: `token=${token}` }
    });
    const body7 = await res7.json() as { message: string; saved: boolean; studioId: string };
    console.log(`[Test 7] Toggle OFF POST /api/wishlist/${studioId} -> Status: ${res7.status}, saved: ${body7.saved}, msg: "${body7.message}"`);
    if (res7.status !== 200 || body7.saved !== false) throw new Error("Expected saved: false on second toggle");

    // 8. Authenticated GET /api/wishlist -> empty array
    const res8 = await fetch(`${baseUrl}/api/wishlist`, {
      headers: { Cookie: `token=${token}` }
    });
    const body8 = await res8.json() as unknown[];
    console.log(`[Test 8] GET /api/wishlist after removal -> Status: ${res8.status}, items: ${body8.length} (Expected: 0)`);
    if (res8.status !== 200 || body8.length !== 0) throw new Error("Expected empty array after untoggling");

    console.log("\nALL WISHLIST BACKEND TESTS PASSED SUCCESSFULLY! ✅\n");
  } finally {
    // Cleanup
    await studios.deleteOne({ _id: insertResult.insertedId });
    await wishlists.deleteMany({ userEmail: testUserEmail });
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await closeDB();
  }
}

runWishlistTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});

