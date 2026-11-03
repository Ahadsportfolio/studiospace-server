import { Router } from "express";
import { createBooking } from "../controllers/bookingController";
import { verifyJWT } from "../middleware/verifyJWT";

const router = Router();

// POST /api/bookings - create booking (pending, overlap check)
router.post("/", verifyJWT, createBooking);

export default router;
