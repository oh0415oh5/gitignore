# Convex Quickstart App

A React + Vite + Convex task manager with WorkOS authentication.

## Prerequisites

- Node.js 18+
- npm 8+

## Setup

```bash
cd convex-app
npm install
cp .env.example .env.local
```

Add your WorkOS client ID to `.env.local`:

```bash
VITE_WORKOS_CLIENT_ID=your_workos_client_id
```

## Development

Start the Convex backend (use this, not `convex deploy`):

```bash
npx convex dev
```

In a second terminal, start the Vite frontend:

```bash
npm run dev
```

For cloud coding agents, `CONVEX_AGENT_MODE=anonymous` is already set in `.env.local` to use an isolated local deployment.

## Project structure

```
convex/
  schema.ts       # Database schema (users, tasks)
  lib/auth.ts     # getCurrentUser helper
  users.ts        # User storage on sign-in
  tasks.ts        # CRUD operations with auth
src/
  ConvexClientProvider.tsx  # Convex + WorkOS auth wiring
  App.tsx                   # Task list UI
```

## Production

Only when ready to ship:

```bash
npx convex deploy
npm run build
```
