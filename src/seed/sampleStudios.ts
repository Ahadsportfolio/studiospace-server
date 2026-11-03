import { ObjectId } from "mongodb";
import { connectDB, getStudiosCollection, closeDB } from "../config/db";
import { StudioDocument } from "../types";

export const SAMPLE_STUDIOS: StudioDocument[] = [
  {
    _id: new ObjectId("660d1f70b3a9c7d4e5f60001"),
    title: "Apex Daylight Infinity Cyclorama Studio",
    category: "Photo Studio",
    hourlyRate: 85,
    securityDeposit: 150,
    maxCapacity: 15,
    location: "142 Greene St, SoHo",
    city: "New York",
    image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=1200&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1527011046414-4781f1f94f8c?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=1200&auto=format&fit=crop"
    ],
    amenities: [
      "24ft Cyc Wall",
      "Profoto D2 Lighting Kit",
      "Hair & Makeup Vanity",
      "Blackout Roller Shades",
      "High-speed Fiber WiFi",
      "Freight Elevator Access"
    ],
    overview:
      "Expansive 2,200 sq ft natural light production studio featuring a 24-foot double-wall white cyclorama, 14-foot industrial ceilings, south-facing windows with blackout shades, Profoto strobe packages, and a dedicated dual-station hair and makeup vanity.",
    rating: 4.95,
    reviewCount: 18,
    reviews: [
      {
        name: "Marcus Vance",
        photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
        rating: 5,
        comment:
          "Incredible natural daylight all afternoon and the cyc wall was freshly painted crisp white. Seamless load-in with the street freight elevator.",
        createdAt: "2026-10-15T14:30:00.000Z"
      }
    ],
    ownerEmail: "marcus.studios@example.com",
    ownerName: "Marcus Vance",
    createdAt: new Date("2026-10-25T10:00:00Z"),
    updatedAt: new Date("2026-10-25T10:00:00Z")
  },
  {
    _id: new ObjectId("660d1f70b3a9c7d4e5f60002"),
    title: "Soundstage Alpha Production Stage",
    category: "Film Stage",
    hourlyRate: 160,
    securityDeposit: 300,
    maxCapacity: 35,
    location: "840 N Cahuenga Blvd, Hollywood",
    city: "Los Angeles",
    image: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=1200&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?q=80&w=1200&auto=format&fit=crop"
    ],
    amenities: [
      "Pre-rigged Lighting Grid",
      "Green Screen Cyc",
      "400A Camlock Power",
      "Silent Production HVAC",
      "Drive-in Roll-up Door",
      "Talent Green Room"
    ],
    overview:
      "Acoustically treated commercial sound stage with motorized pipe grid, 400A three-phase camlock power, chromakey green screen cyc, drive-in roll-up doors, silent HVAC system, and private talent green room.",
    rating: 4.88,
    reviewCount: 12,
    reviews: [
      {
        name: "Elena Rostova",
        photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
        rating: 5,
        comment:
          "Super quiet room with clean power. We shot a 2-day national commercial here and the dialog capture was pristine without background hum.",
        createdAt: "2026-10-22T09:15:00.000Z"
      }
    ],
    ownerEmail: "hollywood.stages@example.com",
    ownerName: "Elena Rostova",
    createdAt: new Date("2026-10-18T12:00:00Z"),
    updatedAt: new Date("2026-10-18T12:00:00Z")
  },
  {
    _id: new ObjectId("660d1f70b3a9c7d4e5f60003"),
    title: "Vocal Vault Dolby Atmos Recording Suite",
    category: "Music Suite",
    hourlyRate: 110,
    securityDeposit: 200,
    maxCapacity: 8,
    location: "215 W Ohio St, River North",
    city: "Chicago",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop"
    ],
    amenities: [
      "Dolby Atmos 7.1.4 Monitoring",
      "SSL AWS 948 Console",
      "Neumann U87 & Telefunken Mics",
      "Double-walled Iso Booth",
      "Pro Tools Ultimate HDX",
      "Private Artist Lounge"
    ],
    overview:
      "World-class tracking and mixing control room centered around an SSL AWS console, Genelec 7.1.4 Dolby Atmos spatial monitoring, vintage Neumann and Telefunken vocal microphones, and floating isolation booth.",
    rating: 5.0,
    reviewCount: 8,
    reviews: [
      {
        name: "David Chen",
        photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
        rating: 5,
        comment:
          "Perfect room acoustics with incredible low-frequency precision. The vocal booth gave us the most intimate acoustic session recording.",
        createdAt: "2026-10-28T18:00:00.000Z"
      }
    ],
    ownerEmail: "soundlab.chicago@example.com",
    ownerName: "David Chen",
    createdAt: new Date("2026-10-10T16:00:00Z"),
    updatedAt: new Date("2026-10-10T16:00:00Z")
  }
];

export async function seedSampleStudios(): Promise<void> {
  const collection = getStudiosCollection();

  for (const studio of SAMPLE_STUDIOS) {
    await collection.updateOne(
      { _id: studio._id },
      { $set: studio },
      { upsert: true }
    );
  }

  const count = await collection.countDocuments();
  console.log(`[Seed] Seeded 3 sample studios. Total studios in DB: ${count}`);
}

// When executed directly via `npx tsx src/seed/sampleStudios.ts`
if (require.main === module) {
  (async () => {
    try {
      await connectDB();
      await seedSampleStudios();
      await closeDB();
      console.log("[Seed] Completed successfully.");
      process.exit(0);
    } catch (err) {
      console.error("[Seed] Error:", err);
      process.exit(1);
    }
  })();
}

