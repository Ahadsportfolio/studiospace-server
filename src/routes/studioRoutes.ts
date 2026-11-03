import { Router } from "express";
import {
  getStudios,
  getStudioById,
  getCategoryCounts,
  getMyStudios,
  createStudio,
  updateStudio,
  deleteStudio
} from "../controllers/studioController";
import { getStudioAvailability } from "../controllers/bookingController";
import { verifyJWT } from "../middleware/verifyJWT";

const router = Router();

// Public studio endpoints
router.get("/", getStudios);
router.get("/categories/counts", getCategoryCounts);

// Studio availability endpoint (public, Confirmed ranges for a day)
router.get("/:id/availability", getStudioAvailability);

// Protected studio endpoints (registered before /:id so /mine is not captured as an :id)
router.get("/mine", verifyJWT, getMyStudios);
router.post("/", verifyJWT, createStudio);
router.put("/:id", verifyJWT, updateStudio);
router.delete("/:id", verifyJWT, deleteStudio);

// Studio details endpoint (must be after /mine and /categories/counts)
router.get("/:id", getStudioById);

export default router;

