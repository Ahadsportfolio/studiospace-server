import { Request, Response, NextFunction } from "express";
import { Filter, ObjectId } from "mongodb";
import { getStudiosCollection, getBookingsCollection } from "../config/db";
import { StudioDocument, StudioCategory } from "../types";

export const CANONICAL_CATEGORIES: StudioCategory[] = [
  "Photo Studio",
  "Film Stage",
  "Podcast Lounge",
  "Music Suite",
  "Workshop"
];

/**
 * GET /api/studios
 * Query params: search (title/location, case-insensitive), category, minPrice, maxPrice,
 * sort (newest|price_asc|price_desc|rating), page, limit.
 * Returns { data, total, page, totalPages }.
 */
export async function getStudios(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { search, category, minPrice, maxPrice, sort, page, limit } = req.query;

    const filter: Filter<StudioDocument> = {};

    // 1. Case-insensitive search on title OR location
    if (typeof search === "string" && search.trim() !== "") {
      const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { title: { $regex: escaped, $options: "i" } },
        { location: { $regex: escaped, $options: "i" } }
      ];
    }

    // 2. Category filter
    if (typeof category === "string" && category.trim() !== "") {
      filter.category = category.trim() as StudioCategory;
    }

    // 3. Price range filter (minPrice, maxPrice)
    const min = minPrice !== undefined && minPrice !== "" ? Number(minPrice) : NaN;
    const max = maxPrice !== undefined && maxPrice !== "" ? Number(maxPrice) : NaN;
    if (!isNaN(min) || !isNaN(max)) {
      filter.hourlyRate = {};
      if (!isNaN(min)) {
        filter.hourlyRate.$gte = min;
      }
      if (!isNaN(max)) {
        filter.hourlyRate.$lte = max;
      }
    }

    // 4. Sort (newest | price_asc | price_desc | rating)
    let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
    if (sort === "price_asc") {
      sortOption = { hourlyRate: 1 };
    } else if (sort === "price_desc") {
      sortOption = { hourlyRate: -1 };
    } else if (sort === "rating") {
      sortOption = { rating: -1, reviewCount: -1 };
    } else if (sort === "newest") {
      sortOption = { createdAt: -1 };
    }

    // 5. Pagination
    const pageNum = Math.max(1, parseInt(String(page || "1"), 10) || 1);
    const limitNum = Math.max(1, parseInt(String(limit || "12"), 10) || 12);
    const skip = (pageNum - 1) * limitNum;

    const studios = getStudiosCollection();
    const total = await studios.countDocuments(filter);
    const totalPages = Math.ceil(total / limitNum);

    const data = await studios
      .find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .toArray();

    res.status(200).json({
      data,
      total,
      page: pageNum,
      totalPages
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/studios/categories/counts
 * Returns studio count per canonical category.
 */
export async function getCategoryCounts(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const studios = getStudiosCollection();

    const counts = await studios
      .aggregate<{ _id: string; count: number }>([
        { $group: { _id: "$category", count: { $sum: 1 } } }
      ])
      .toArray();

    const countMap = new Map<string, number>();
    for (const item of counts) {
      if (item._id) {
        countMap.set(item._id, item.count);
      }
    }

    const data = CANONICAL_CATEGORIES.map((cat) => ({
      category: cat,
      count: countMap.get(cat) || 0
    }));

    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/studios/:id
 * Validates ObjectId (400 if invalid format, 404 if not found).
 */
export async function getStudioById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    // Validate 24 hex characters ObjectId
    const isValidFormat =
      typeof id === "string" &&
      /^[0-9a-fA-F]{24}$/.test(id) &&
      ObjectId.isValid(id);

    if (!isValidFormat) {
      res.status(400).json({ message: "Invalid studio ID format" });
      return;
    }

    const studios = getStudiosCollection();
    const studio = await studios.findOne({ _id: new ObjectId(id) });

    if (!studio) {
      res.status(404).json({ message: "Studio not found" });
      return;
    }

    res.status(200).json(studio);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/studios/mine
 * Authenticated via verifyJWT.
 * Returns all studios owned by the authenticated user (sorted by createdAt desc).
 */
export async function getMyStudios(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user || !req.user.email) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const studios = getStudiosCollection();
    const escapedEmail = req.user.email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const myStudios = await studios
      .find({
        ownerEmail: { $regex: new RegExp(`^${escapedEmail}$`, "i") }
      })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json(myStudios);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/studios
 * Authenticated via verifyJWT.
 * Validates required fields and types.
 * Enforces ownerEmail and ownerName FROM THE JWT (never from body).
 * Sets rating: 0, reviewCount: 0, reviews: [], createdAt, updatedAt.
 */
export async function createStudio(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user || !req.user.email) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const {
      title,
      category,
      hourlyRate,
      securityDeposit,
      maxCapacity,
      location,
      city,
      image,
      gallery,
      amenities,
      overview
    } = req.body || {};

    // 1. Title validation
    if (typeof title !== "string" || title.trim() === "") {
      res.status(400).json({ message: "Studio title is required and must be a non-empty string" });
      return;
    }

    // 2. Category validation (exact 5 categories)
    if (
      typeof category !== "string" ||
      !CANONICAL_CATEGORIES.includes(category.trim() as StudioCategory)
    ) {
      res.status(400).json({
        message: `Category must be one of: ${CANONICAL_CATEGORIES.join(", ")}`
      });
      return;
    }

    // 3. Hourly rate validation (positive number > 0)
    const rateNum = Number(hourlyRate);
    if (hourlyRate === undefined || isNaN(rateNum) || rateNum <= 0) {
      res.status(400).json({ message: "Hourly rate is required and must be a positive number" });
      return;
    }

    // 4. Security deposit validation (non-negative number >= 0, default 0)
    let depositNum = 0;
    if (securityDeposit !== undefined && securityDeposit !== null && securityDeposit !== "") {
      depositNum = Number(securityDeposit);
      if (isNaN(depositNum) || depositNum < 0) {
        res.status(400).json({ message: "Security deposit must be a non-negative number" });
        return;
      }
    }

    // 5. Max capacity validation (positive integer >= 1)
    const capNum = Number(maxCapacity);
    if (maxCapacity === undefined || isNaN(capNum) || capNum < 1 || !Number.isInteger(capNum)) {
      res.status(400).json({
        message: "Max capacity is required and must be a positive whole number of at least 1"
      });
      return;
    }

    // 6. Location validation
    if (typeof location !== "string" || location.trim() === "") {
      res.status(400).json({ message: "Location address is required and must be a non-empty string" });
      return;
    }

    // 7. City validation (optional string)
    let cityStr = "";
    if (city !== undefined && city !== null) {
      if (typeof city !== "string") {
        res.status(400).json({ message: "City must be a string" });
        return;
      }
      cityStr = city.trim();
    }

    // 8. Cover image validation
    if (typeof image !== "string" || image.trim() === "") {
      res.status(400).json({ message: "Studio cover image URL is required" });
      return;
    }

    // 9. Gallery validation (array of strings, defaults to [image])
    let galleryArr: string[] = [image.trim()];
    if (gallery !== undefined && gallery !== null) {
      if (!Array.isArray(gallery) || !gallery.every((item) => typeof item === "string")) {
        res.status(400).json({ message: "Gallery must be an array of image URL strings" });
        return;
      }
      galleryArr = gallery.map((item) => item.trim()).filter((item) => item.length > 0);
      if (galleryArr.length === 0) {
        galleryArr = [image.trim()];
      }
    }

    // 10. Amenities validation (array of strings, defaults to [])
    let amenitiesArr: string[] = [];
    if (amenities !== undefined && amenities !== null) {
      if (!Array.isArray(amenities) || !amenities.every((item) => typeof item === "string")) {
        res.status(400).json({ message: "Amenities must be an array of strings" });
        return;
      }
      amenitiesArr = amenities.map((item) => item.trim()).filter((item) => item.length > 0);
    }

    // 11. Overview validation
    if (typeof overview !== "string" || overview.trim() === "") {
      res.status(400).json({ message: "Detailed overview is required and must be a non-empty string" });
      return;
    }

    const now = new Date();

    // Construct studio document: ownerEmail and ownerName ALWAYS from JWT
    const newStudio: StudioDocument = {
      title: title.trim(),
      category: category.trim() as StudioCategory,
      hourlyRate: rateNum,
      securityDeposit: depositNum,
      maxCapacity: capNum,
      location: location.trim(),
      city: cityStr,
      image: image.trim(),
      gallery: galleryArr,
      amenities: amenitiesArr,
      overview: overview.trim(),
      rating: 0,
      reviewCount: 0,
      reviews: [],
      ownerEmail: req.user.email,
      ownerName: req.user.name || "Studio Host",
      createdAt: now,
      updatedAt: now
    };

    const studios = getStudiosCollection();
    const result = await studios.insertOne(newStudio);

    res.status(201).json({
      ...newStudio,
      _id: result.insertedId
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/studios/:id
 * Authenticated via verifyJWT.
 * Owner only (returns 403 if authenticated user is not the studio owner).
 * Whitelists editable fields. Never changes ownerEmail, ownerName, rating, reviews, createdAt.
 */
export async function updateStudio(
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

    // Validate ObjectId format
    const isValidFormat =
      typeof id === "string" &&
      /^[0-9a-fA-F]{24}$/.test(id) &&
      ObjectId.isValid(id);

    if (!isValidFormat) {
      res.status(400).json({ message: "Invalid studio ID format" });
      return;
    }

    const studios = getStudiosCollection();
    const studio = await studios.findOne({ _id: new ObjectId(id) });

    if (!studio) {
      res.status(404).json({ message: "Studio not found" });
      return;
    }

    // Owner check: compare ownerEmail with verified JWT user email (case-insensitive)
    if (studio.ownerEmail.toLowerCase() !== req.user.email.toLowerCase()) {
      res.status(403).json({ message: "Forbidden: You do not have permission to edit this studio" });
      return;
    }

    const body = req.body || {};
    const updateFields: Partial<StudioDocument> = {};

    // Whitelist and validate permissible fields
    if ("title" in body) {
      if (typeof body.title !== "string" || body.title.trim() === "") {
        res.status(400).json({ message: "Studio title must be a non-empty string" });
        return;
      }
      updateFields.title = body.title.trim();
    }

    if ("category" in body) {
      if (
        typeof body.category !== "string" ||
        !CANONICAL_CATEGORIES.includes(body.category.trim() as StudioCategory)
      ) {
        res.status(400).json({
          message: `Category must be one of: ${CANONICAL_CATEGORIES.join(", ")}`
        });
        return;
      }
      updateFields.category = body.category.trim() as StudioCategory;
    }

    if ("hourlyRate" in body) {
      const rateNum = Number(body.hourlyRate);
      if (isNaN(rateNum) || rateNum <= 0) {
        res.status(400).json({ message: "Hourly rate must be a positive number" });
        return;
      }
      updateFields.hourlyRate = rateNum;
    }

    if ("securityDeposit" in body) {
      const depNum = Number(body.securityDeposit);
      if (isNaN(depNum) || depNum < 0) {
        res.status(400).json({ message: "Security deposit must be a non-negative number" });
        return;
      }
      updateFields.securityDeposit = depNum;
    }

    if ("maxCapacity" in body) {
      const capNum = Number(body.maxCapacity);
      if (isNaN(capNum) || capNum < 1 || !Number.isInteger(capNum)) {
        res.status(400).json({
          message: "Max capacity must be a positive whole number of at least 1"
        });
        return;
      }
      updateFields.maxCapacity = capNum;
    }

    if ("location" in body) {
      if (typeof body.location !== "string" || body.location.trim() === "") {
        res.status(400).json({ message: "Location address must be a non-empty string" });
        return;
      }
      updateFields.location = body.location.trim();
    }

    if ("city" in body) {
      if (typeof body.city !== "string") {
        res.status(400).json({ message: "City must be a string" });
        return;
      }
      updateFields.city = body.city.trim();
    }

    if ("image" in body) {
      if (typeof body.image !== "string" || body.image.trim() === "") {
        res.status(400).json({ message: "Studio cover image URL must be a non-empty string" });
        return;
      }
      updateFields.image = body.image.trim();
    }

    if ("gallery" in body) {
      if (
        !Array.isArray(body.gallery) ||
        !body.gallery.every((item: unknown) => typeof item === "string")
      ) {
        res.status(400).json({ message: "Gallery must be an array of image URL strings" });
        return;
      }
      updateFields.gallery = body.gallery
        .map((item: string) => item.trim())
        .filter((item: string) => item.length > 0);
    }

    if ("amenities" in body) {
      if (
        !Array.isArray(body.amenities) ||
        !body.amenities.every((item: unknown) => typeof item === "string")
      ) {
        res.status(400).json({ message: "Amenities must be an array of strings" });
        return;
      }
      updateFields.amenities = body.amenities
        .map((item: string) => item.trim())
        .filter((item: string) => item.length > 0);
    }

    if ("overview" in body) {
      if (typeof body.overview !== "string" || body.overview.trim() === "") {
        res.status(400).json({ message: "Detailed overview must be a non-empty string" });
        return;
      }
      updateFields.overview = body.overview.trim();
    }

    // Check if at least one whitelisted field was provided
    if (Object.keys(updateFields).length === 0) {
      res.status(400).json({ message: "No valid fields provided for update" });
      return;
    }

    // Explicitly guarantee ownerEmail, ownerName, rating, reviewCount, reviews, createdAt are NEVER updated
    updateFields.updatedAt = new Date();

    await studios.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    const updatedStudio = await studios.findOne({ _id: new ObjectId(id) });

    res.status(200).json(updatedStudio);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/studios/:id
 * Authenticated via verifyJWT.
 * Owner only (returns 403 if authenticated user is not the studio owner).
 * Cancels that studio's Pending bookings.
 */
export async function deleteStudio(
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

    // Validate ObjectId format
    const isValidFormat =
      typeof id === "string" &&
      /^[0-9a-fA-F]{24}$/.test(id) &&
      ObjectId.isValid(id);

    if (!isValidFormat) {
      res.status(400).json({ message: "Invalid studio ID format" });
      return;
    }

    const studios = getStudiosCollection();
    const studio = await studios.findOne({ _id: new ObjectId(id) });

    if (!studio) {
      res.status(404).json({ message: "Studio not found" });
      return;
    }

    // Owner check: compare ownerEmail with verified JWT user email (case-insensitive)
    if (studio.ownerEmail.toLowerCase() !== req.user.email.toLowerCase()) {
      res.status(403).json({ message: "Forbidden: You do not have permission to delete this studio" });
      return;
    }

    // 1. Delete studio from database
    await studios.deleteOne({ _id: new ObjectId(id) });

    // 2. Also cancel that studio's Pending bookings
    const bookings = getBookingsCollection();
    const cancelResult = await bookings.updateMany(
      {
        studioId: { $in: [studio._id, id, new ObjectId(id)] },
        status: "Pending"
      },
      {
        $set: {
          status: "Cancelled"
        }
      }
    );

    res.status(200).json({
      message: "Studio deleted successfully",
      id,
      cancelledPendingBookings: cancelResult.modifiedCount
    });
  } catch (error) {
    next(error);
  }
}

