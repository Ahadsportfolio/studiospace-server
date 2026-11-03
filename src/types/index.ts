import { ObjectId } from "mongodb";

export type StudioCategory =
  | "Photo Studio"
  | "Film Stage"
  | "Podcast Lounge"
  | "Music Suite"
  | "Workshop";

export interface StudioReview {
  name: string;
  photo: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface StudioDocument {
  _id?: ObjectId;
  title: string;
  category: StudioCategory;
  hourlyRate: number;
  securityDeposit: number;
  maxCapacity: number;
  location: string;
  city: string;
  image: string;
  gallery: string[];
  amenities: string[];
  overview: string;
  rating: number;
  reviewCount: number;
  reviews: StudioReview[];
  ownerEmail: string;
  ownerName: string;
  createdAt: Date;
  updatedAt: Date;
}

export type BookingStatus = "Pending" | "Confirmed" | "Completed" | "Cancelled";

export interface BookingDocument {
  _id?: ObjectId;
  studioId: ObjectId | string;
  studioTitle: string;
  studioImage: string;
  hostEmail: string;
  userEmail: string;
  userName: string;
  date: string;
  startTime: string;
  endTime: string;
  startAt: Date;
  endAt: Date;
  hours: number;
  totalPrice: number;
  securityDeposit: number;
  notes?: string;
  status: BookingStatus;
  createdAt: Date;
}

export interface WishlistDocument {
  _id?: ObjectId;
  userEmail: string;
  studioId: ObjectId | string;
  createdAt: Date;
}

export interface JwtUserPayload {
  email: string;
  name: string;
  photo?: string;
}

export interface BetterAuthUserDocument {
  _id?: ObjectId | string;
  name: string;
  email: string;
  image?: string;
  emailVerified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BetterAuthSessionDocument {
  _id?: ObjectId | string;
  userId: string;
  token: string;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtUserPayload;
    }
  }
}


