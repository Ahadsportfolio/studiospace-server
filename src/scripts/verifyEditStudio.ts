import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { connectDB, closeDB, getStudiosCollection } from "../config/db";
import { env } from "../config/env";
import { StudioDocument } from "../types";

async function runEditStudioVerification() {
  console.log("==========================================================");
  console.log("  StudioSpace — Edit Studio (/api/studios/:id) Verification");
  console.log("==========================================================\n");

  await connectDB();
  const studios = getStudiosCollection();

  const ownerEmail = "verified.host@studiospace.com";
  const intruderEmail = "unauthorized.user@studiospace.com";

  const ownerToken = jwt.sign(
    { email: ownerEmail, name: "Verified Host" },
    env.JWT_SECRET
  );
  const intruderToken = jwt.sign(
    { email: intruderEmail, name: "Intruder User" },
    env.JWT_SECRET
  );

  // Clean previous test artifacts
  await studios.deleteMany({ location: "Verification Suite Edit Studio" });

  // 1. Create a test studio
  const initialDate = new Date("2026-01-01T00:00:00.000Z");
  const insertResult = await studios.insertOne({
    title: "Original Test Studio Title",
    category: "Photo Studio",
    hourlyRate: 75,
    securityDeposit: 50,
    maxCapacity: 8,
    location: "Verification Suite Edit Studio",
    city: "Brooklyn, NY",
    image: "https://images.unsplash.com/photo-original",
    gallery: ["https://images.unsplash.com/photo-original"],
    amenities: ["Original Wi-Fi", "Softbox Lighting"],
    overview: "Original description of the creative studio before editing.",
    rating: 4.8,
    reviewCount: 12,
    reviews: [],
    ownerEmail: ownerEmail,
    ownerName: "Verified Host",
    createdAt: initialDate,
    updatedAt: initialDate,
  });

  const studioId = insertResult.insertedId.toString();
  console.log(`[Setup] Test studio created with ID: ${studioId}\n`);

  // Start express server in-memory testing or test controller directly
  const app = (await import("../app.js")).default;
  const http = await import("http");
  const server = http.createServer(app as any);

  await new Promise<void>((resolve) => {
    server.listen(0, () => resolve());
  });

  const address = server.address() as { port: number };
  const port = address.port;
  const baseUrl = `http://localhost:${port}/api/studios`;

  try {
    // Test 1: Unauthenticated PUT -> 401
    const res1 = await fetch(`${baseUrl}/${studioId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Hacked Title" }),
    });
    console.log(`Test 1: Unauthenticated PUT -> Status: ${res1.status} (Expected: 401)`);
    if (res1.status !== 401) throw new Error("Expected 401 for unauthenticated request");

    // Test 2: Forbidden PUT (intruder trying to edit owner's studio) -> 403
    const res2 = await fetch(`${baseUrl}/${studioId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: `token=${intruderToken}`,
      },
      body: JSON.stringify({ title: "Intruder Hijack" }),
    });
    console.log(`Test 2: Non-owner PUT -> Status: ${res2.status} (Expected: 403)`);
    if (res2.status !== 403) throw new Error("Expected 403 for non-owner request");

    // Test 3: Invalid studio ID format -> 400
    const res3 = await fetch(`${baseUrl}/invalid-id-format`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: `token=${ownerToken}`,
      },
      body: JSON.stringify({ title: "Bad ID" }),
    });
    console.log(`Test 3: Invalid ID format -> Status: ${res3.status} (Expected: 400)`);
    if (res3.status !== 400) throw new Error("Expected 400 for invalid id format");

    // Test 4: Non-existent studio ID -> 404
    const fakeId = new ObjectId().toString();
    const res4 = await fetch(`${baseUrl}/${fakeId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: `token=${ownerToken}`,
      },
      body: JSON.stringify({ title: "Ghost Studio" }),
    });
    console.log(`Test 4: Non-existent studio ID -> Status: ${res4.status} (Expected: 404)`);
    if (res4.status !== 404) throw new Error("Expected 404 for non-existent studio id");

    // Test 5: Valid Owner PUT -> 200 OK
    const updatePayload = {
      title: "Updated Modern Daylight Cyc Studio",
      category: "Film Stage",
      hourlyRate: 125,
      securityDeposit: 200,
      maxCapacity: 15,
      location: "Verification Suite Edit Studio",
      city: "Manhattan, NY",
      image: "https://images.unsplash.com/photo-updated",
      gallery: [
        "https://images.unsplash.com/photo-updated",
        "https://images.unsplash.com/photo-gallery-2",
      ],
      amenities: ["Motorized Cyc Wall", "Aputure 600d Lights", "Hair & Makeup Vanity"],
      overview: "Newly renovated sound-dampened film stage featuring continuous 3-point lighting.",
      // Attempting to spoof ownerEmail and rating (should be ignored by backend)
      ownerEmail: "spoofed.email@evil.com",
      ownerName: "Spoofed Host",
      rating: 5.0,
      reviewCount: 999,
    };

    const res5 = await fetch(`${baseUrl}/${studioId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: `token=${ownerToken}`,
      },
      body: JSON.stringify(updatePayload),
    });

    console.log(`Test 5: Valid Owner PUT -> Status: ${res5.status} (Expected: 200)`);
    if (res5.status !== 200) {
      const errText = await res5.text();
      throw new Error(`Expected 200, got ${res5.status}: ${errText}`);
    }

    const updatedData = (await res5.json()) as StudioDocument;
    console.log(`Updated Title: "${updatedData.title}"`);
    console.log(`Updated Category: "${updatedData.category}"`);
    console.log(`Updated Hourly Rate: $${updatedData.hourlyRate}/hr`);
    console.log(`Updated Deposit: $${updatedData.securityDeposit}`);
    console.log(`Updated Capacity: ${updatedData.maxCapacity} creators`);
    console.log(`Updated City: "${updatedData.city}"`);

    // Verify immutable fields remained untouched
    if (updatedData.ownerEmail !== ownerEmail) {
      throw new Error(`Security Violation: ownerEmail was modified! Expected "${ownerEmail}", got "${updatedData.ownerEmail}"`);
    }
    if (updatedData.ownerName !== "Verified Host") {
      throw new Error(`Security Violation: ownerName was modified! Expected "Verified Host", got "${updatedData.ownerName}"`);
    }
    if (updatedData.rating !== 4.8) {
      throw new Error(`Security Violation: rating was modified! Expected 4.8, got ${updatedData.rating}`);
    }
    if (updatedData.reviewCount !== 12) {
      throw new Error(`Security Violation: reviewCount was modified! Expected 12, got ${updatedData.reviewCount}`);
    }

    console.log("\n[Security Pass] Immutable fields (ownerEmail, ownerName, rating, reviewCount) securely protected!");

    // Clean up test studio
    await studios.deleteOne({ _id: new ObjectId(studioId) });
    console.log("[Cleanup] Test studio removed from database.");
    console.log("\n>>> ALL EDIT STUDIO VERIFICATION TESTS PASSED SUCCESSFULLY! <<<\n");
  } finally {
    server.close();
    await closeDB();
  }
}

runEditStudioVerification().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
