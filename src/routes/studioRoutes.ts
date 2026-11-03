import { Router } from "express";
import {
  getStudios,
  getStudioById,
  getCategoryCounts
} from "../controllers/studioController";

const router = Router();

// Public studio endpoints
router.get("/", getStudios);
router.get("/categories/counts", getCategoryCounts);
router.get("/:id", getStudioById);

export default router;
