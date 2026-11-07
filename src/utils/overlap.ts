import { Filter, ObjectId } from "mongodb";
import { getBookingsCollection } from "../config/db";
import { BookingDocument } from "../types";

export interface CheckOverlapOptions {
  studioId: ObjectId | string;
  startAt: Date;
  endAt: Date;
  excludeBookingId?: ObjectId | string;
}

export interface BookingTimeValidationSuccess {
  valid: true;
  startAt: Date;
  endAt: Date;
  hours: number;
}

export interface BookingTimeValidationFailure {
  valid: false;
  error: string;
}

export type BookingTimeValidationResult =
  | BookingTimeValidationSuccess
  | BookingTimeValidationFailure;

/**
 * Validates date, startTime, and endTime.
 * Rules:
 * 1. date must be valid YYYY-MM-DD and not in the past
 * 2. startTime and endTime must be valid HH:mm
 * 3. endTime must be strictly after startTime (end > start)
 * 4. duration must be at least 1 hour (>= 60 minutes)
 */
export function validateBookingTimes(
  date: unknown,
  startTime: unknown,
  endTime: unknown
): BookingTimeValidationResult {
  // 1. Validate date string format YYYY-MM-DD
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return {
      valid: false,
      error: "Booking date is required and must be in YYYY-MM-DD format"
    };
  }

  const parsedDate = new Date(`${date}T00:00:00.000Z`);
  if (isNaN(parsedDate.getTime())) {
    return {
      valid: false,
      error: "Invalid booking date format"
    };
  }

  // Check date not in the past (compare with current UTC date)
  const todayStr = new Date().toISOString().split("T")[0];
  if (date < todayStr) {
    return {
      valid: false,
      error: "Booking date cannot be in the past"
    };
  }

  // 2. Validate startTime and endTime format HH:mm
  const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
  if (typeof startTime !== "string" || !timeRegex.test(startTime)) {
    return {
      valid: false,
      error: "Start time is required and must be in HH:mm 24-hour format (e.g. 10:00)"
    };
  }

  if (typeof endTime !== "string" || !timeRegex.test(endTime)) {
    return {
      valid: false,
      error: "End time is required and must be in HH:mm 24-hour format (e.g. 14:00)"
    };
  }

  const [sH, sM] = startTime.split(":").map(Number);
  const [eH, eM] = endTime.split(":").map(Number);
  const startMinutes = sH * 60 + sM;
  const endMinutes = eH * 60 + eM;

  // 3. Validate end > start
  if (endMinutes <= startMinutes) {
    return {
      valid: false,
      error: "End time must be after start time"
    };
  }

  // 4. Validate duration >= 1 hour (60 minutes)
  const durationMinutes = endMinutes - startMinutes;
  if (durationMinutes < 60) {
    return {
      valid: false,
      error: "Booking duration must be at least 1 hour"
    };
  }

  const hours = Math.round((durationMinutes / 60) * 100) / 100;
  const startAt = new Date(`${date}T${startTime}:00.000Z`);
  const endAt = new Date(`${date}T${endTime}:00.000Z`);

  return {
    valid: true,
    startAt,
    endAt,
    hours
  };
}

/**
 * Checks if a proposed time slot collides with any Confirmed booking for the studio.
 * Overlap formula:
 * { studioId, status: "Confirmed", startAt: { $lt: newEnd }, endAt: { $gt: newStart } }
 *
 * Back-to-back bookings (e.g. 10:00-12:00 and 12:00-14:00) do NOT collide because
 * 12:00 is neither strictly less than 12:00 nor strictly greater than 12:00.
 */
export async function checkBookingOverlap(
  options: CheckOverlapOptions
): Promise<boolean> {
  const { studioId, startAt, endAt, excludeBookingId } = options;
  const bookings = getBookingsCollection();

  // Match studioId whether stored as ObjectId or string
  const studioFilter = ObjectId.isValid(studioId)
    ? { $in: [new ObjectId(studioId), studioId.toString()] }
    : studioId;

  const query: Filter<BookingDocument> = {
    studioId: studioFilter as any,
    status: "Confirmed",
    startAt: { $lt: endAt },
    endAt: { $gt: startAt }
  };

  if (excludeBookingId) {
    if (ObjectId.isValid(excludeBookingId)) {
      query._id = {
        $nin: [new ObjectId(excludeBookingId), excludeBookingId.toString()] as any
      };
    } else {
      query._id = { $ne: excludeBookingId as any };
    }
  }

  const conflict = await bookings.findOne(query);
  return conflict !== null;
}

