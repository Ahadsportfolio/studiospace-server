# StudioSpace Server

Express + TypeScript + MongoDB API for StudioSpace.

🔗 **Live API:** https://YOUR-SERVER-URL
🖥️ **Client repo:** https://github.com/YOUR-USERNAME/studiospace-client

## Features
- Studio CRUD with owner-only update/delete
- JWT in HTTPOnly cookies; 401 for unauthenticated, 403 for non-owner
- Booking creation with overlap check against Confirmed bookings (409 on collision)
- Host booking status management and availability endpoint
- Wishlist toggle and saved studios retrieval (POST /api/wishlist/:studioId, GET /api/wishlist)
- Search, filter, sort and pagination

## Setup
```bash
npm install
cp .env.example .env
npm run seed   # optional sample data
npm run dev    # http://localhost:5000
```

## API
See the route table in `docs/API_ROUTES.md` of the workspace (copy it here before submission).
