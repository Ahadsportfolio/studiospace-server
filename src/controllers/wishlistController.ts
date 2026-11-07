import { Request, Response, NextFunction } from "express";
import { ObjectId } from "mongodb";
import { getStudiosCollection, getWishlistsCollection } from "../config/db";
import { WishlistDocument } from "../types";

/**
 * POST /api/wishlist/:studioId
 * Authenticated via verifyJWT.
 * Toggles a studio in the user's wishlist:
 * - If already saved -> removes it, returns { message: "Removed from wishlist", saved: false, studioId }
 * - If not saved -> adds it, returns { message: "Added to wishlist", saved: true, studioId }
 */
export async function toggleWishlist(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user || !req.user.email) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const rawStudioId = req.params.studioId || req.body?.studioId;
    if (
      typeof rawStudioId !== "string" ||
      !ObjectId.isValid(rawStudioId) ||
      !/^[0-9a-fA-F]{24}$/.test(rawStudioId)
    ) {
      res.status(400).json({ message: "Invalid studio ID format" });
      return;
    }

    const studioObjectId = new ObjectId(rawStudioId);
    const studios = getStudiosCollection();
    const studio = await studios.findOne({ _id: studioObjectId });
    if (!studio) {
      res.status(404).json({ message: "Studio not found" });
      return;
    }

    const wishlists = getWishlistsCollection();
    const userEmail = req.user.email.trim().toLowerCase();

    // Query for existing entry matching either ObjectId or string format, and case-insensitive email
    const escapedEmail = userEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const existing = await wishlists.findOne({
      userEmail: { $regex: new RegExp(`^${escapedEmail}$`, "i") },
      $or: [{ studioId: studioObjectId }, { studioId: rawStudioId }]
    });

    if (existing) {
      // Remove from wishlist
      await wishlists.deleteOne({ _id: existing._id });
      res.status(200).json({
        message: "Studio removed from wishlist",
        saved: false,
        studioId: rawStudioId
      });
      return;
    }

    // Add to wishlist
    const newEntry: WishlistDocument = {
      userEmail: userEmail,
      studioId: studioObjectId,
      createdAt: new Date()
    };

    await wishlists.insertOne(newEntry);

    res.status(200).json({
      message: "Studio added to wishlist",
      saved: true,
      studioId: rawStudioId
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/wishlist
 * Authenticated via verifyJWT.
 * Returns array of populated studios currently in the user's wishlist,
 * sorted by most recently saved first.
 */
export async function getWishlist(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user || !req.user.email) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const userEmail = req.user.email.trim();
    const escapedEmail = userEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const wishlists = getWishlistsCollection();

    const savedStudios = await wishlists
      .aggregate([
        {
          $match: {
            userEmail: { $regex: new RegExp(`^${escapedEmail}$`, "i") }
          }
        },
        { $sort: { createdAt: -1 } },
        {
          $lookup: {
            from: "studios",
            let: { targetId: "$studioId" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $or: [
                      { $eq: ["$_id", "$$targetId"] },
                      {
                        $eq: [
                          { $toString: "$_id" },
                          { $toString: "$$targetId" }
                        ]
                      }
                    ]
                  }
                }
              }
            ],
            as: "studio"
          }
        },
        { $unwind: "$studio" },
        {
          $project: {
            _id: "$studio._id",
            title: "$studio.title",
            category: "$studio.category",
            hourlyRate: "$studio.hourlyRate",
            securityDeposit: "$studio.securityDeposit",
            maxCapacity: "$studio.maxCapacity",
            location: "$studio.location",
            city: "$studio.city",
            image: "$studio.image",
            gallery: "$studio.gallery",
            amenities: "$studio.amenities",
            overview: "$studio.overview",
            rating: "$studio.rating",
            reviewCount: "$studio.reviewCount",
            reviews: "$studio.reviews",
            ownerEmail: "$studio.ownerEmail",
            ownerName: "$studio.ownerName",
            createdAt: "$studio.createdAt",
            updatedAt: "$studio.updatedAt",
            savedAt: "$createdAt",
            wishlistId: "$_id"
          }
        }
      ])
      .toArray();

    res.status(200).json(savedStudios);
  } catch (error) {
    next(error);
  }
}
