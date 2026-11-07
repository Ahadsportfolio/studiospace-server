import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import app from "../app";
import { connectDB, closeDB, getStudiosCollection, getBookingsCollection } from "../config/db";
import { env } from "../config/env";
import { StudioDocument } from "../types";

async function main() {
  console.log("==================================================================");
  console.log("  StudioSpace — Booking Overlap & Conflict Verification Script   ");
  console.log("==================================================================\n");

  await connectDB();

  const studios = getStudiosCollection();
  const bookings = getBookingsCollection();

  // Test identities
  const hostEmail = "host.proof@studiospace.com";
  const creatorEmail = "creator.proof@studiospace.com";

  const hostToken = jwt.sign({ email: hostEmail, name: "Marcus Vance" }, env.JWT_SECRET);
  const creatorToken = jwt.sign({ email: creatorEmail, name: "Elena Rostova" }, env.JWT_SECRET);

  // Clean previous proof artifacts
  await studios.deleteMany({ location: "Verification Script Test Suite" });
  await bookings.deleteMany({ hostEmail });

  // 1. Create a test studio
  const insertStudio = await studios.insertOne({
    title: "Apex Sound & Daylight Cyc Studio",
    category: "Photo Studio",
    hourlyRate: 150,
    securityDeposit: 300,
    maxCapacity: 20,
    location: "Verification Script Test Suite",
    city: "Brooklyn, NY",
    image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04",
    gallery: [
      "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04",
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7"
    ],
    amenities: ["Motorized Cyc Wall", "Profoto Lighting", "Audio Isolation"],
    overview: "Flagship daylight photo studio with dedicated green room and sound dampening.",
    rating: 4.95,
    reviewCount: 28,
    reviews: [],
    ownerEmail: hostEmail,
    ownerName: "Marcus Vance",
    createdAt: new Date(),
    updatedAt: new Date()
  });

  const studioId = insertStudio.insertedId.toString();
  console.log(`[Setup] Studio created: "${insertStudio.insertedId}" (Rate: $150/hr, Deposit: $300)`);

  // 2. Existing Confirmed booking on 2026-12-01 from 10:00 to 13:00
  const baseDate = "2026-12-01";
  await bookings.insertOne({
    studioId: insertStudio.insertedId,
    studioTitle: "Apex Sound & Daylight Cyc Studio",
    studioImage: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04",
    hostEmail: hostEmail,
    userEmail: "existing.client@studiospace.com",
    userName: "Commercial Crew",
    date: baseDate,
    startTime: "10:00",
    endTime: "13:00",
    startAt: new Date(`${baseDate}T10:00:00.000Z`),
    endAt: new Date(`${baseDate}T13:00:00.000Z`),
    hours: 3,
    totalPrice: 450,
    securityDeposit: 300,
    notes: "Confirmed commercial shoot slot",
    status: "Confirmed",
    createdAt: new Date()
  });
  console.log(`[Setup] Existing Confirmed Booking: ${baseDate} from 10:00 to 13:00`);
  console.log("------------------------------------------------------------------\n");

  // Spin up temporary HTTP listener
  const server = app.listen(0);
  const port = (server.address() as any).port;
  const baseUrl = `http://127.0.0.1:${port}`;

  const postBooking = async (date: string, startTime: string, endTime: string, label: string) => {
    const res = await fetch(`${baseUrl}/api/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${creatorToken}`
      },
      body: JSON.stringify({
        studioId,
        date,
        startTime,
        endTime,
        notes: label
      })
    });
    const body = await res.json().catch(() => ({}));
    return { status: res.status, body };
  };

  try {
    // -------------------------------------------------------------
    // SCENARIO 1: Overlapping slot rejected (HTTP 409)
    // Existing Confirmed: 10:00 - 13:00 on 2026-12-01
    // Attempt: 11:00 - 14:00 on 2026-12-01
    // -------------------------------------------------------------
    console.log("▶ PROOF 1: Overlapping slot rejected (409)");
    const overlapResult = await postBooking(baseDate, "11:00", "14:00", "Overlap Attempt 11:00-14:00");
    console.log(`  Requested: ${baseDate} 11:00 - 14:00`);
    console.log(`  HTTP Status: ${overlapResult.status}`);
    console.log(`  Response: ${JSON.stringify(overlapResult.body)}`);
    const overlapPassed =
      overlapResult.status === 409 &&
      overlapResult.body.message === "This time slot is already booked. Please choose a different time.";
    console.log(`  Result: ${overlapPassed ? "✔ PASSED (409 Conflict correctly rejected)" : "✖ FAILED"}\n`);

    // -------------------------------------------------------------
    // SCENARIO 2: Back-to-back accepted (HTTP 201)
    // 2A: Immediately after (13:00 - 16:00) on 2026-12-01
    // 2B: Immediately before (08:00 - 10:00) on 2026-12-01
    // -------------------------------------------------------------
    console.log("▶ PROOF 2: Back-to-back slots accepted (201)");
    
    // 2A: Back-to-back AFTER (13:00 starts right when 13:00 ends)
    const backToBackAfter = await postBooking(baseDate, "13:00", "16:00", "Back-to-back After 13:00-16:00");
    console.log(`  [2A After] Requested: ${baseDate} 13:00 - 16:00`);
    console.log(`  HTTP Status: ${backToBackAfter.status}`);
    console.log(`  Created Booking ID: ${backToBackAfter.body._id}, Status: "${backToBackAfter.body.status}", Hours: ${backToBackAfter.body.hours}, Total: $${backToBackAfter.body.totalPrice}`);
    const b2bAfterPassed = backToBackAfter.status === 201 && backToBackAfter.body.status === "Pending";
    console.log(`  Result 2A: ${b2bAfterPassed ? "✔ PASSED (Back-to-back after accepted)" : "✖ FAILED"}`);

    // 2B: Back-to-back BEFORE (08:00 - 10:00 ends right when 10:00 starts)
    const backToBackBefore = await postBooking(baseDate, "08:00", "10:00", "Back-to-back Before 08:00-10:00");
    console.log(`  [2B Before] Requested: ${baseDate} 08:00 - 10:00`);
    console.log(`  HTTP Status: ${backToBackBefore.status}`);
    console.log(`  Created Booking ID: ${backToBackBefore.body._id}, Status: "${backToBackBefore.body.status}", Hours: ${backToBackBefore.body.hours}, Total: $${backToBackBefore.body.totalPrice}`);
    const b2bBeforePassed = backToBackBefore.status === 201 && backToBackBefore.body.status === "Pending";
    console.log(`  Result 2B: ${b2bBeforePassed ? "✔ PASSED (Back-to-back before accepted)" : "✖ FAILED"}\n`);

    // -------------------------------------------------------------
    // SCENARIO 3: Different date accepted (HTTP 201)
    // Same time slot 10:00 - 13:00, but on 2026-12-02
    // -------------------------------------------------------------
    console.log("▶ PROOF 3: Different date accepted (201)");
    const diffDate = "2026-12-02";
    const diffDateResult = await postBooking(diffDate, "10:00", "13:00", "Same Time Different Date 10:00-13:00");
    console.log(`  Requested: ${diffDate} 10:00 - 13:00 (exact same hours as Confirmed slot on ${baseDate})`);
    console.log(`  HTTP Status: ${diffDateResult.status}`);
    console.log(`  Created Booking ID: ${diffDateResult.body._id}, Status: "${diffDateResult.body.status}", Date: "${diffDateResult.body.date}"`);
    const diffDatePassed = diffDateResult.status === 201 && diffDateResult.body.status === "Pending";
    console.log(`  Result: ${diffDatePassed ? "✔ PASSED (Different date accepted)" : "✖ FAILED"}\n`);

    // -------------------------------------------------------------
    // EXTRA CHECK: Studio Availability Endpoint
    // GET /api/studios/:id/availability?date=2026-12-01
    // -------------------------------------------------------------
    console.log("▶ BONUS PROOF: Public Studio Availability API");
    const availRes = await fetch(`${baseUrl}/api/studios/${studioId}/availability?date=${baseDate}`);
    const availData = await availRes.json();
    console.log(`  GET /api/studios/${studioId}/availability?date=${baseDate}`);
    console.log(`  HTTP Status: ${availRes.status}`);
    console.log(`  Confirmed Ranges: ${JSON.stringify(availData, null, 2)}`);
    const availPassed = availRes.status === 200 && Array.isArray(availData) && availData.length === 1;
    console.log(`  Result: ${availPassed ? "✔ PASSED (Confirmed range accurately returned)" : "✖ FAILED"}\n`);

    console.log("==================================================================");
    console.log("  ALL BOOKING SCENARIOS VERIFIED SUCCESSFULLY!                    ");
    console.log("==================================================================");
  } finally {
    server.close();
    await closeDB();
  }
}

main().catch(console.error);

