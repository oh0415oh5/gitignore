# Convex Authentication App

This directory contains a Vite + React app with Convex authentication using WorkOS AuthKit.

## Setup

1. Install dependencies:

```bash
cd app
npm install
```

2. Start Convex (creates a dev deployment and syncs auth config):

```bash
npx convex dev
```

When `WORKOS_CLIENT_ID` and `WORKOS_API_KEY` are available, Convex can auto-provision AuthKit and write frontend env vars to `.env.local`.

3. In a second terminal, start the frontend:

```bash
npm run dev
```

## What's included

- `convex/schema.ts` — users table with `tokenIdentifier` and role indexes
- `convex/lib/auth.ts` — `getCurrentUser`, `getCurrentUserOrNull`, `requireAdmin`
- `convex/lib/customFunctions.ts` — `authedQuery` and `authedMutation` wrappers
- `convex/users.ts` — `storeUser`, `getCurrent`, `getViewer`, `updateProfile`
- `convex/auth.config.ts` — WorkOS JWT validation for Convex
- `src/main.tsx` — WorkOS AuthKit + `ConvexProviderWithAuthKit`

## Auth flow

1. User signs in via WorkOS AuthKit.
2. `ConvexProviderWithAuthKit` passes the JWT to Convex.
3. On first authenticated session, the app calls `users.storeUser` to create or update the user record.
4. Protected queries use `getCurrentUser` or the `authedQuery` wrapper.

## Environment variables

Copy `.env.example` to `.env.local` and fill in values from the Convex dashboard and WorkOS dashboard if auto-provisioning does not set them.
