import { Request, Response, NextFunction } from "express";
import { ObjectId } from "mongodb";
import { getBookingsCollection, getStudiosCollection } from "../config/db";
import { BookingDocument } from "../types";
import { checkBookingOverlap, validateBookingTimes } from "../utils/overlap";

/**
 * POST /api/bookings
 * Authenticated via verifyJWT.
 * Body: { studioId, date, startTime, endTime, notes }
 * Validates:
 * - date not in the past, valid YYYY-MM-DD
 * - end time > start time
 * - duration >= 1 hour
 * Loads studio:
 * - host cannot book own studio (403)
 * - computes hours, totalPrice, securityDeposit on the server
 * Checks overlap vs Confirmed bookings:
 * - collision -> 409 { message: "This time slot is already booked. Please choose a different time." }
 * Else inserts booking with status "Pending" and returns 201.
 */
export async function createBooking(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user || !req.user.email) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { studioId, date, startTime, endTime, notes } = req.body || {};

    // 1. Validate studio ID format
    if (
      typeof studioId !== "string" ||
      !ObjectId.isValid(studioId) ||
      !/^[0-9a-fA-F]{24}$/.test(studioId)
    ) {
      res.status(400).json({ message: "Invalid studio ID format" });
      return;
    }

    // 2. Validate date and time ranges
    const timeValidation = validateBookingTimes(date, startTime, endTime);
    if (!timeValidation.valid) {
      res.status(400).json({ message: timeValidation.error });
      return;
    }

    const { startAt, endAt, hours } = timeValidation;

    // 3. Load studio from DB
    const studios = getStudiosCollection();
    const studio = await studios.findOne({ _id: new ObjectId(studioId) });
    if (!studio) {
      res.status(404).json({ message: "Studio not found" });
      return;
    }

    // 4. Host cannot book own studio (403)
    if (studio.ownerEmail.toLowerCase() === req.user.email.toLowerCase()) {
      res.status(403).json({ message: "Hosts cannot book their own studio" });
      return;
    }

    // 5. Overlap check against Confirmed bookings
    const isOverlapping = await checkBookingOverlap({
      studioId: studio._id,
      startAt,
      endAt
    });

    if (isOverlapping) {
      res.status(409).json({
        message: "This time slot is already booked. Please choose a different time."
      });
      return;
    }

    // 6. Compute price and security deposit on the server
    const totalPrice = Math.round(hours * studio.hourlyRate * 100) / 100;
    const securityDeposit = studio.securityDeposit ?? 0;

    const newBooking: BookingDocument = {
      studioId: studio._id,
      studioTitle: studio.title,
      studioImage: studio.image,
      hostEmail: studio.ownerEmail,
      userEmail: req.user.email,
      userName: req.user.name || "Studio Creator",
      date,
      startTime,
      endTime,
      startAt,
      endAt,
      hours,
      totalPrice,
      securityDeposit,
      notes: typeof notes === "string" ? notes.trim() : "",
      status: "Pending",
      createdAt: new Date()
    };

    const bookings = getBookingsCollection();
    const insertResult = await bookings.insertOne(newBooking);

    res.status(201).json({
      ...newBooking,
      _id: insertResult.insertedId
    });
  } catch (error) {
    next(error);
  }
}
