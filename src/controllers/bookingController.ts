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

/**
 * GET /api/bookings/my
 * Authenticated via verifyJWT.
 * Returns all bookings made by the authenticated user, sorted newest first.
 */
export async function getMyBookings(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user || !req.user.email) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const bookings = getBookingsCollection();
    const escapedEmail = req.user.email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const myBookings = await bookings
      .find({
        userEmail: { $regex: new RegExp(`^${escapedEmail}$`, "i") }
      })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json(myBookings);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/bookings/host
 * Authenticated via verifyJWT.
 * Returns all booking requests for studios owned by the authenticated host, sorted newest first.
 */
export async function getHostBookings(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user || !req.user.email) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const bookings = getBookingsCollection();
    const escapedEmail = req.user.email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const hostBookings = await bookings
      .find({
        hostEmail: { $regex: new RegExp(`^${escapedEmail}$`, "i") }
      })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json(hostBookings);
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/bookings/:id/cancel
 * Authenticated via verifyJWT.
 * Booker only (403 if not booker).
 * Pending only (400 if not Pending).
 * Sets status to "Cancelled".
 */
export async function cancelBooking(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user || !req.user.email) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { id } = req.params;

    if (
      typeof id !== "string" ||
      !ObjectId.isValid(id) ||
      !/^[0-9a-fA-F]{24}$/.test(id)
    ) {
      res.status(400).json({ message: "Invalid booking ID format" });
      return;
    }

    const bookings = getBookingsCollection();
    const booking = await bookings.findOne({ _id: new ObjectId(id) });

    if (!booking) {
      res.status(404).json({ message: "Booking not found" });
      return;
    }

    // Only the creator who made the booking can cancel via this endpoint
    if (booking.userEmail.toLowerCase() !== req.user.email.toLowerCase()) {
      res.status(403).json({
        message: "Forbidden: You can only cancel your own bookings"
      });
      return;
    }

    // Cancellation is only permitted for bookings with Pending status
    if (booking.status !== "Pending") {
      res.status(400).json({
        message: "Only bookings with Pending status can be cancelled"
      });
      return;
    }

    await bookings.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: "Cancelled" } }
    );

    const updatedBooking = await bookings.findOne({ _id: new ObjectId(id) });
    res.status(200).json(updatedBooking);
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/bookings/:id/status
 * Authenticated via verifyJWT.
 * Host only (403 if not host).
 * Allowed status values: "Confirmed" | "Completed" | "Cancelled".
 * On "Confirmed": re-runs overlap check excluding same _id; returns 409 if collision occurs.
 */
export async function updateBookingStatus(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user || !req.user.email) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { id } = req.params;

    if (
      typeof id !== "string" ||
      !ObjectId.isValid(id) ||
      !/^[0-9a-fA-F]{24}$/.test(id)
    ) {
      res.status(400).json({ message: "Invalid booking ID format" });
      return;
    }

    const { status } = req.body || {};
    const allowedStatuses = ["Confirmed", "Completed", "Cancelled"];

    if (typeof status !== "string" || !allowedStatuses.includes(status)) {
      res.status(400).json({
        message: "Status must be one of: Confirmed, Completed, Cancelled"
      });
      return;
    }

    const bookings = getBookingsCollection();
    const booking = await bookings.findOne({ _id: new ObjectId(id) });

    if (!booking) {
      res.status(404).json({ message: "Booking not found" });
      return;
    }

    // Host only check
    if (booking.hostEmail.toLowerCase() !== req.user.email.toLowerCase()) {
      res.status(403).json({
        message: "Forbidden: Only the studio host can update booking status"
      });
      return;
    }

    // On status -> "Confirmed", re-run overlap excluding same _id
    if (status === "Confirmed") {
      const isOverlapping = await checkBookingOverlap({
        studioId: booking.studioId,
        startAt: booking.startAt,
        endAt: booking.endAt,
        excludeBookingId: booking._id
      });

      if (isOverlapping) {
        res.status(409).json({
          message: "This time slot is already booked. Please choose a different time."
        });
        return;
      }
    }

    await bookings.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: status as any } }
    );

    const updatedBooking = await bookings.findOne({ _id: new ObjectId(id) });
    res.status(200).json(updatedBooking);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/studios/:id/availability?date=YYYY-MM-DD
 * Public endpoint.
 * Returns array of confirmed booking ranges for the studio on the specified date:
 * [ { startTime, endTime, startAt, endAt } ]
 */
export async function getStudioAvailability(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    if (
      typeof id !== "string" ||
      !ObjectId.isValid(id) ||
      !/^[0-9a-fA-F]{24}$/.test(id)
    ) {
      res.status(400).json({ message: "Invalid studio ID format" });
      return;
    }

    const { date } = req.query;

    if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      res.status(400).json({
        message: "Date query parameter is required in YYYY-MM-DD format"
      });
      return;
    }

    const parsedDate = new Date(`${date}T00:00:00.000Z`);
    if (isNaN(parsedDate.getTime())) {
      res.status(400).json({ message: "Invalid date format" });
      return;
    }

    const studios = getStudiosCollection();
    const studio = await studios.findOne({ _id: new ObjectId(id) });
    if (!studio) {
      res.status(404).json({ message: "Studio not found" });
      return;
    }

    const bookings = getBookingsCollection();
    const dayStart = new Date(`${date}T00:00:00.000Z`);
    const dayEnd = new Date(`${date}T23:59:59.999Z`);

    const confirmedBookings = await bookings
      .find({
        studioId: { $in: [studio._id, id, new ObjectId(id)] as any },
        status: "Confirmed",
        $or: [
          { date: date },
          { startAt: { $lt: dayEnd }, endAt: { $gt: dayStart } }
        ]
      })
      .sort({ startAt: 1 })
      .toArray();

    const confirmedRanges = confirmedBookings.map((b) => ({
      startTime: b.startTime,
      endTime: b.endTime,
      startAt: b.startAt,
      endAt: b.endAt
    }));

    res.status(200).json(confirmedRanges);
  } catch (error) {
    next(error);
  }
}
