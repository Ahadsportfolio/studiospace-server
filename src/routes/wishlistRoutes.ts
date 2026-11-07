import { Router } from "express";
import { toggleWishlist, getWishlist } from "../controllers/wishlistController";
import { verifyJWT } from "../middleware/verifyJWT";

const router = Router();

// GET /api/wishlist - list saved studios for authenticated user
router.get("/", verifyJWT, getWishlist);

// POST /api/wishlist/:studioId - toggle studio saved/unsaved in wishlist
router.post("/:studioId", verifyJWT, toggleWishlist);

// POST /api/wishlist/:studioId/toggle - alias for toggle
router.post("/:studioId/toggle", verifyJWT, toggleWishlist);

export default router;
