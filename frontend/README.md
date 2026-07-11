# CoRoute — Frontend (CoRoute redesign)

Redesigned React + Vite + Tailwind frontend for the CoRoute campus carpooling app.
Preserves all routes, API calls, and business logic from the original frontend.

## Setup

```bash
npm install
cp .env.example .env   # set VITE_BACKEND_URL to your backend's URL
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Structure

- `src/api.js` — axios instance, reads `VITE_BACKEND_URL`
- `src/context/AuthContext.jsx` — auth state, persisted in localStorage
- `src/components/` — Navbar, Footer, RideCard, RideList, SearchFilter, LiveMap, HeroSection, ProtectedRoute
- `src/pages/` — Home, Login, Signup, FindRide, OfferRide, Profile, Inbox, Chat, TrackRide

Deploying to Vercel: `vercel.json` rewrites all routes to `index.html` for client-side routing.
