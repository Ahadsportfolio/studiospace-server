import { Request, Response, NextFunction } from "express";
import { Filter, ObjectId } from "mongodb";
import { getStudiosCollection } from "../config/db";
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

