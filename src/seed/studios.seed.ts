import { ObjectId } from "mongodb";
import { connectDB, getStudiosCollection, closeDB } from "../config/db";
import { env } from "../config/env";
import { StudioDocument } from "../types";

export const SEEDED_STUDIOS: StudioDocument[] = [
  // 1. Photo Studio
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
      "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1200&auto=format&fit=crop"
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
      "Expansive 2,200 sq ft daylight studio featuring a 24-foot double-wall white cyclorama, 14-foot industrial loft ceilings, south-facing windows with blackout roller blinds, Profoto strobe kits, and a dual-station hair and makeup vanity.",
    rating: 4.95,
    reviewCount: 2,
    reviews: [
      {
        name: "Marcus Vance",
        photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
        rating: 5,
        comment:
          "Incredible natural daylight all afternoon and the cyc wall was freshly painted crisp white. Seamless load-in with the street freight elevator.",
        createdAt: "2026-10-15T14:30:00.000Z"
      },
      {
        name: "Chloe Dupont",
        photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
        rating: 4.9,
        comment:
          "Shot our spring lookbook here. The Profoto heads fired consistently and the hair/makeup station has superb 5000K daylight-balanced mirrors.",
        createdAt: "2026-10-21T18:10:00.000Z"
      }
    ],
    ownerEmail: env.SEED_OWNER_EMAIL,
    ownerName: "StudioSpace Host",
    createdAt: new Date("2026-10-10T10:00:00Z"),
    updatedAt: new Date("2026-10-10T10:00:00Z")
  },

  // 2. Photo Studio
  {
    _id: new ObjectId("660d1f70b3a9c7d4e5f60002"),
    title: "Sunlit Industrial Loft & Portrait Studio",
    category: "Photo Studio",
    hourlyRate: 75,
    securityDeposit: 120,
    maxCapacity: 12,
    location: "68 Jay St, DUMBO",
    city: "Brooklyn",
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1200&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop"
    ],
    amenities: [
      "Exposed Brick Backdrop",
      "Seamless Paper Rolls",
      "C-Stands & Sandbags",
      "Natural Sunlight",
      "Wardrobe Steamer",
      "Bluetooth Sound System"
    ],
    overview:
      "Historic Brooklyn warehouse loft flooded with natural morning light through authentic 12-foot steel casement windows. Exposed brick walls, weathered hardwood floors, rolling c-stands, seamless background paper rolls, and designer mid-century set furniture for editorial portraits.",
    rating: 4.88,
    reviewCount: 2,
    reviews: [
      {
        name: "Devon Miller",
        photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
        rating: 5,
        comment:
          "The brick texture and original hardwood gave our portraits an authentic magazine finish. Super responsive host and very easy lockbox access.",
        createdAt: "2026-10-18T11:20:00.000Z"
      },
      {
        name: "Sasha Lee",
        photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop",
        rating: 4.8,
        comment:
          "Plenty of grip gear and seamless paper options. Loved having the heavy-duty steamer ready to go right out of the gate.",
        createdAt: "2026-10-26T16:45:00.000Z"
      }
    ],
    ownerEmail: env.SEED_OWNER_EMAIL,
    ownerName: "StudioSpace Host",
    createdAt: new Date("2026-10-11T11:00:00Z"),
    updatedAt: new Date("2026-10-11T11:00:00Z")
  },

  // 3. Photo Studio
  {
    _id: new ObjectId("660d1f70b3a9c7d4e5f60003"),
    title: "Neon Prism Dark Room & Creative Photo Lab",
    category: "Photo Studio",
    hourlyRate: 95,
    securityDeposit: 180,
    maxCapacity: 16,
    location: "1230 E 8th St, Arts District",
    city: "Los Angeles",
    image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=1200&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=1200&auto=format&fit=crop"
    ],
    amenities: [
      "Programmable RGB Tube Grid",
      "Atmospheric Haze Machine",
      "Ceiling Pantographs",
      "Blackout Stage",
      "Styling Dressing Room",
      "Private Restroom"
    ],
    overview:
      "Darkened creative studio space designed for dramatic strobe and ambient light play. Outfitted with programmable RGB LED tube arrays, haze machines, ceiling-mounted pantographs, mirrors, and vintage prop furniture for high-concept fashion shoots and album covers.",
    rating: 4.92,
    reviewCount: 2,
    reviews: [
      {
        name: "Jordan Wu",
        photo: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200&auto=format&fit=crop",
        rating: 5,
        comment:
          "The DMX-controlled LED tubes allow you to dial in any aesthetic within seconds. The haze machine filled the room with smooth, even diffusion.",
        createdAt: "2026-10-22T20:15:00.000Z"
      },
      {
        name: "Maya Sterling",
        photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&auto=format&fit=crop",
        rating: 4.8,
        comment:
          "Clean blackout setup with zero light leaks. Our music artist loved the creative vibe and the styling dressing room had plenty of rack space.",
        createdAt: "2026-10-29T14:30:00.000Z"
      }
    ],
    ownerEmail: env.SEED_OWNER_EMAIL,
    ownerName: "StudioSpace Host",
    createdAt: new Date("2026-10-12T09:30:00Z"),
    updatedAt: new Date("2026-10-12T09:30:00Z")
  },

  // 4. Film Stage
  {
    _id: new ObjectId("660d1f70b3a9c7d4e5f60004"),
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
      "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=1200&auto=format&fit=crop"
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
    rating: 4.9,
    reviewCount: 2,
    reviews: [
      {
        name: "Elena Rostova",
        photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
        rating: 5,
        comment:
          "Super quiet room with clean power. We shot a 2-day national commercial here and the dialog capture was pristine without background hum.",
        createdAt: "2026-10-22T09:15:00.000Z"
      },
      {
        name: "Tariq Edwards",
        photo: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=200&auto=format&fit=crop",
        rating: 4.8,
        comment:
          "Drive-in loading bay saved our grip team at least two hours of carting heavy heads. Top-tier facility for serious video productions.",
        createdAt: "2026-10-28T13:00:00.000Z"
      }
    ],
    ownerEmail: env.SEED_OWNER_EMAIL,
    ownerName: "StudioSpace Host",
    createdAt: new Date("2026-10-13T12:00:00Z"),
    updatedAt: new Date("2026-10-13T12:00:00Z")
  },

  // 5. Film Stage
  {
    _id: new ObjectId("660d1f70b3a9c7d4e5f60005"),
    title: "Metropolis High-Ceiling Virtual Production Stage",
    category: "Film Stage",
    hourlyRate: 210,
    securityDeposit: 450,
    maxCapacity: 45,
    location: "1550 Ellsworth Industrial Blvd NW",
    city: "Atlanta",
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=1200&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1536240478700-b869070f9279?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=1200&auto=format&fit=crop"
    ],
    amenities: [
      "22ft Clear Rigging Height",
      "Production Office Suite",
      "Scissor Lift Onsite",
      "Heavy Equipment Loading Dock",
      "3-Phase Power Distribution",
      "Craft Services Kitchen"
    ],
    overview:
      "Modern 4,000 sq ft film soundstage equipped with high-density LED backdrop wall capabilities, 22-foot clear rigging heights, heavy-duty scissor lift access, multi-cam broadcast control room, and production offices for feature shoots and commercials.",
    rating: 5.0,
    reviewCount: 2,
    reviews: [
      {
        name: "Carlos Mendez",
        photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
        rating: 5,
        comment:
          "Huge clearance space and the onsite scissor lift made hanging our 20x20 overhead silk effortless. Staff was courteous and highly professional.",
        createdAt: "2026-10-24T17:40:00.000Z"
      },
      {
        name: "Rachel Kim",
        photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
        rating: 5,
        comment:
          "The client viewing lounge and craft kitchen kept our executive producers happy throughout our 14-hour marathon production.",
        createdAt: "2026-10-30T19:00:00.000Z"
      }
    ],
    ownerEmail: env.SEED_OWNER_EMAIL,
    ownerName: "StudioSpace Host",
    createdAt: new Date("2026-10-14T08:00:00Z"),
    updatedAt: new Date("2026-10-14T08:00:00Z")
  },

  // 6. Film Stage
  {
    _id: new ObjectId("660d1f70b3a9c7d4e5f60006"),
    title: "CineVault Micro Stage & Insert Studio",
    category: "Film Stage",
    hourlyRate: 125,
    securityDeposit: 250,
    maxCapacity: 20,
    location: "245 Carlaw Ave, Studio District",
    city: "Toronto",
    image: "https://images.unsplash.com/photo-1536240478700-b869070f9279?q=80&w=1200&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1536240478700-b869070f9279?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1585647347384-2593bc35786b?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1514306191717-452ec28c7814?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=1200&auto=format&fit=crop"
    ],
    amenities: [
      "Motorized Tabletop Turntable",
      "Overhead Diffusion Box",
      "Acoustic Wall Panels",
      "4K Client Video Village",
      "Equipment Staging Area",
      "Dedicated Client Lounge"
    ],
    overview:
      "Intimate and cost-effective film insert stage ideal for tabletop cinematography, product commercials, interviews, and music video cutaways. Includes motorized turntable, overhead softbox rig, sound baffling, and dedicated video village monitor feed.",
    rating: 4.85,
    reviewCount: 2,
    reviews: [
      {
        name: "Liam O'Connor",
        photo: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200&auto=format&fit=crop",
        rating: 5,
        comment:
          "Perfect studio for our luxury beverage macro commercial. Motorized turntable had speed presets down to millimeter accuracy.",
        createdAt: "2026-10-25T15:10:00.000Z"
      },
      {
        name: "Valerie Chang",
        photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
        rating: 4.7,
        comment:
          "Compact but smartly laid out. Audio quality was dead quiet during our corporate documentary sit-downs.",
        createdAt: "2026-10-31T10:45:00.000Z"
      }
    ],
    ownerEmail: env.SEED_OWNER_EMAIL,
    ownerName: "StudioSpace Host",
    createdAt: new Date("2026-10-15T10:30:00Z"),
    updatedAt: new Date("2026-10-15T10:30:00Z")
  },

  // 7. Podcast Lounge
  {
    _id: new ObjectId("660d1f70b3a9c7d4e5f60007"),
    title: "The Broadcaster 4-Person Video Podcast Suite",
    category: "Podcast Lounge",
    hourlyRate: 65,
    securityDeposit: 100,
    maxCapacity: 8,
    location: "1104 E 6th St, East Austin",
    city: "Austin",
    image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=1200&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1589903102059-7d60df452816?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1526394931762-90052e97b376?q=80&w=1200&auto=format&fit=crop"
    ],
    amenities: [
      "4x Shure SM7B Microphones",
      "Rodecaster Pro II Console",
      "3x 4K Sony Cinema Cameras",
      "Acoustic Wood Slat Wall",
      "Customizable RGB Backlight",
      "Live Stream Ready Gigabit LAN"
    ],
    overview:
      "Broadcast-ready multimedia podcast lounge featuring four Shure SM7B dynamic microphones on yellow boom arms, Rodecaster Pro II mixer, Blackmagic 4K cameras with live ATEM switching, acoustic slat walls, and customizable LED accent shelving.",
    rating: 4.95,
    reviewCount: 2,
    reviews: [
      {
        name: "Tyler Bennett",
        photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
        rating: 5,
        comment:
          "Turnkey podcast setup! We plugged our SD cards into the Rodecaster and had pristine multi-track audio and ISO video recordings ready to edit immediately.",
        createdAt: "2026-10-19T16:00:00.000Z"
      },
      {
        name: "Samantha Ruiz",
        photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&auto=format&fit=crop",
        rating: 4.9,
        comment:
          "The slat wall and warm accent lights looked unbelievable on camera. Guests commented on how comfortable the custom lounge seating was.",
        createdAt: "2026-10-27T12:30:00.000Z"
      }
    ],
    ownerEmail: env.SEED_OWNER_EMAIL,
    ownerName: "StudioSpace Host",
    createdAt: new Date("2026-10-16T14:00:00Z"),
    updatedAt: new Date("2026-10-16T14:00:00Z")
  },

  // 8. Podcast Lounge
  {
    _id: new ObjectId("660d1f70b3a9c7d4e5f60008"),
    title: "Skyline Fireside Podcast & Interview Studio",
    category: "Podcast Lounge",
    hourlyRate: 70,
    securityDeposit: 110,
    maxCapacity: 6,
    location: "333 N Michigan Ave, The Loop",
    city: "Chicago",
    image: "https://images.unsplash.com/photo-1526394931762-90052e97b376?q=80&w=1200&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1526394931762-90052e97b376?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=1200&auto=format&fit=crop"
    ],
    amenities: [
      "Velvet Club Armchairs",
      "Multi-Pattern Condenser Mics",
      "Studio Headphone Monitors",
      "4K Teleprompter Setup",
      "Soundproof Double Door",
      "Espresso Bar & Water Station"
    ],
    overview:
      "Upscale executive interview studio offering plush velvet armchairs, acoustic fabric panels, Shure MV7 podcast mics, studio-grade headphone monitors, and optional teleprompter integration for high-profile executive interviews and narrative podcasts.",
    rating: 4.88,
    reviewCount: 2,
    reviews: [
      {
        name: "Arthur Pendelton",
        photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
        rating: 5,
        comment:
          "Hosted our CEO quarterly podcast here. The sound isolation in downtown Chicago was rock solid, and the espresso machine was a thoughtful touch.",
        createdAt: "2026-10-23T10:00:00.000Z"
      },
      {
        name: "Nadia Belov",
        photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop",
        rating: 4.75,
        comment:
          "Very classy setup. The teleprompter rig was calibrated smoothly and the headphone distribution amp gave everyone their own custom mix.",
        createdAt: "2026-10-29T18:20:00.000Z"
      }
    ],
    ownerEmail: env.SEED_OWNER_EMAIL,
    ownerName: "StudioSpace Host",
    createdAt: new Date("2026-10-17T15:00:00Z"),
    updatedAt: new Date("2026-10-17T15:00:00Z")
  },

  // 9. Music Suite
  {
    _id: new ObjectId("660d1f70b3a9c7d4e5f60009"),
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
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1200&auto=format&fit=crop"
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
    reviewCount: 2,
    reviews: [
      {
        name: "David Chen",
        photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
        rating: 5,
        comment:
          "Perfect room acoustics with incredible low-frequency precision. The vocal booth gave us the most intimate acoustic session recording.",
        createdAt: "2026-10-28T18:00:00.000Z"
      },
      {
        name: "Grace Hopper",
        photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
        rating: 5,
        comment:
          "The Genelec Atmos setup is mind-blowing. Hearing our stems in 3D surround sound helped us complete our final master in half the time.",
        createdAt: "2026-11-01T21:00:00.000Z"
      }
    ],
    ownerEmail: env.SEED_OWNER_EMAIL,
    ownerName: "StudioSpace Host",
    createdAt: new Date("2026-10-18T16:00:00Z"),
    updatedAt: new Date("2026-10-18T16:00:00Z")
  },

  // 10. Music Suite
  {
    _id: new ObjectId("660d1f70b3a9c7d4e5f6000a"),
    title: "Analog Haven Tape Tracking & Beat Lab",
    category: "Music Suite",
    hourlyRate: 90,
    securityDeposit: 160,
    maxCapacity: 10,
    location: "1021 16th Ave S, Music Row",
    city: "Nashville",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=1200&auto=format&fit=crop"
    ],
    amenities: [
      "Yamaha U1 Upright Piano",
      "Vintage Analog Synthesizers",
      "Universal Audio Apollo x8p",
      "Studer Master Tape Machine",
      "Fender Rhodes Mark I",
      "Nearfield Focal Monitors"
    ],
    overview:
      "Vibrant creative tracking space on historic Music Row packed with vintage analog synthesizers, drum machines, Studer 2-track tape machine, Universal Audio Apollo interfaces, and Yamaha upright acoustic piano.",
    rating: 4.9,
    reviewCount: 2,
    reviews: [
      {
        name: "Jackson Reed",
        photo: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200&auto=format&fit=crop",
        rating: 5,
        comment:
          "The Rhodes Mark I through the tube preamp was pure magic. This studio oozes musical character and vintage vibe that you simply cannot simulate in a plugin.",
        createdAt: "2026-10-25T13:45:00.000Z"
      },
      {
        name: "Lila Fontaine",
        photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
        rating: 4.8,
        comment:
          "Tracked full rhythm section beds here. Great microphone collection including Coles ribbons that made our brass section sing.",
        createdAt: "2026-10-31T17:15:00.000Z"
      }
    ],
    ownerEmail: env.SEED_OWNER_EMAIL,
    ownerName: "StudioSpace Host",
    createdAt: new Date("2026-10-19T13:00:00Z"),
    updatedAt: new Date("2026-10-19T13:00:00Z")
  },

  // 11. Workshop
  {
    _id: new ObjectId("660d1f70b3a9c7d4e5f6000b"),
    title: "Artisan Ceramic & Clay Sculpting Workshop",
    category: "Workshop",
    hourlyRate: 55,
    securityDeposit: 90,
    maxCapacity: 18,
    location: "5410 Ballard Ave NW, Ballard",
    city: "Seattle",
    image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?q=80&w=1200&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1531747056595-07f6cbbe10ad?q=80&w=1200&auto=format&fit=crop"
    ],
    amenities: [
      "8x Brent Pottery Wheels",
      "Skutt Electric Kiln",
      "Large Wedging Tables",
      "Glaze Dipping Station",
      "Clay Slab Roller",
      "Industrial Apron & Tool Kit"
    ],
    overview:
      "Spacious community art studio with polished concrete floors, 8 motorized Brent pottery wheels, large clay wedging tables, Skutt electric kiln, drying racks, and natural north-facing clerestory windows.",
    rating: 4.92,
    reviewCount: 2,
    reviews: [
      {
        name: "Emily Thornton",
        photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&auto=format&fit=crop",
        rating: 5,
        comment:
          "Hosted a weekend intensive ceramic masterclass for 8 students. Every wheel was in great working order and the clay scrap sinks make cleanup effortless.",
        createdAt: "2026-10-26T15:30:00.000Z"
      },
      {
        name: "Kenji Sato",
        photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
        rating: 4.85,
        comment:
          "Generous natural daylight through the north roof monitors. Plenty of drying shelves to leave greenware safe between firing sessions.",
        createdAt: "2026-11-01T11:00:00.000Z"
      }
    ],
    ownerEmail: env.SEED_OWNER_EMAIL,
    ownerName: "StudioSpace Host",
    createdAt: new Date("2026-10-20T11:00:00Z"),
    updatedAt: new Date("2026-10-20T11:00:00Z")
  },

  // 12. Workshop
  {
    _id: new ObjectId("660d1f70b3a9c7d4e5f6000c"),
    title: "Foundry Woodworking & Maker Fabrication Space",
    category: "Workshop",
    hourlyRate: 60,
    securityDeposit: 100,
    maxCapacity: 15,
    location: "3460 Larimer St, RiNo",
    city: "Denver",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=1200&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1581092335397-9583fe92d232?q=80&w=1200&auto=format&fit=crop"
    ],
    amenities: [
      "SawStop 3HP Table Saw",
      "Festool HEPA Dust Extraction",
      "Solid Maple Workbenches",
      "8-inch Helical Jointer",
      "Clamping & Assembly Wall",
      "Overhead Air Filtration"
    ],
    overview:
      "Industrial timber and fabrication maker space boasting SawStop cabinet table saws, 8-inch helical jointer, 20-inch planer, Festool dust extraction, heavy maple workbenches, and secure material storage for woodworking and prop making.",
    rating: 4.95,
    reviewCount: 2,
    reviews: [
      {
        name: "Garrett Larson",
        photo: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=200&auto=format&fit=crop",
        rating: 5,
        comment:
          "The SawStop equipment and helical jointer are dialed in dead square. Cut my custom live-edge dining table glue-up time in half.",
        createdAt: "2026-10-27T19:00:00.000Z"
      },
      {
        name: "Mira Patel",
        photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop",
        rating: 4.9,
        comment:
          "Cleanest maker shop I've ever rented. The overhead air scrubbers and Festool extraction keep airborne dust virtually non-existent.",
        createdAt: "2026-11-02T14:15:00.000Z"
      }
    ],
    ownerEmail: env.SEED_OWNER_EMAIL,
    ownerName: "StudioSpace Host",
    createdAt: new Date("2026-10-21T09:00:00Z"),
    updatedAt: new Date("2026-10-21T09:00:00Z")
  }
];

/**
 * Idempotent seeder:
 * Updates each studio if it exists, or inserts it if it doesn't.
 * Running this multiple times produces the exact same 12 studios without duplicating.
 */
export async function seedStudios(): Promise<void> {
  const collection = getStudiosCollection();

  console.log(`[Seed] Seeding ${SEEDED_STUDIOS.length} studios with ownerEmail: ${env.SEED_OWNER_EMAIL}...`);

  for (const studio of SEEDED_STUDIOS) {
    // Ensure ownerEmail reflects current env value dynamically
    const studioData = {
      ...studio,
      ownerEmail: env.SEED_OWNER_EMAIL
    };

    await collection.updateOne(
      { _id: studio._id },
      { $set: studioData },
      { upsert: true }
    );
  }

  const count = await collection.countDocuments();
  console.log(`[Seed] Seed complete. Total studios in DB: ${count}`);
}

// When executed directly via `npm run seed`
if (require.main === module) {
  (async () => {
    try {
      await connectDB();
      await seedStudios();
      await closeDB();
      console.log("[Seed] Completed successfully.");
      process.exit(0);
    } catch (err) {
      console.error("[Seed] Fatal seeding error:", err);
      process.exit(1);
    }
  })();
}

