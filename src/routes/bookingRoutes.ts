import { Router } from "express";
import {
  createBooking,
  getMyBookings,
  getHostBookings,
  cancelBooking,
  updateBookingStatus
} from "../controllers/bookingController";
import { verifyJWT } from "../middleware/verifyJWT";

const router = Router();

// GET /api/bookings/my - my bookings (creator)
router.get("/my", verifyJWT, getMyBookings);

// GET /api/bookings/host - bookings for my studios (host)
router.get("/host", verifyJWT, getHostBookings);

// POST /api/bookings - create booking (pending, overlap check)
router.post("/", verifyJWT, createBooking);

// PATCH /api/bookings/:id/cancel - cancel pending booking (booker only)
router.patch("/:id/cancel", verifyJWT, cancelBooking);

// PATCH /api/bookings/:id/status - update booking status (host only: Confirmed|Completed|Cancelled)
router.patch("/:id/status", verifyJWT, updateBookingStatus);

export default router;
