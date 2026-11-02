---
phase: 1
title: "Foundation and Architecture"
status: pending
priority: P1
dependencies: []
---

# Phase 1: Foundation and Architecture

## Overview
Establish the project repository structure (Monorepo with pnpm workspaces), set up TypeScript contracts, define the PostgreSQL schema with Prisma, and finalize configuration for both frontend (Next.js) and backend (Fastify + Socket.io) environments.

## Requirements
- **Functional Requirements:**
  - Setup unified monorepo: `apps/web` (Next.js 15), `apps/server` (Fastify + Socket.io), and `packages/shared-types` (DTOs, game event contracts, validation schemas).
  - Setup Docker Compose for local development (PostgreSQL 16, Redis 7).
  - Define unified database schema covering `PlayerAccount`, `AvatarProgress`, `GameSession`, `SessionParticipant`, `GameResult`, `PersonalBest`, and `XPTransaction`.
- **Non-Functional Requirements:**
  - Strict type sharing between client and server to prevent payload drift.
  - Reproducible local environment across Windows, Linux, and macOS.
  - Zero-config linting and formatting via Biome or ESLint + Prettier.

## Architecture

```
nostalgic-mimic-game/
├── apps/
│   ├── web/                    # Next.js 15 App Router, Tailwind CSS, shadcn/ui
│   │   ├── src/app/
│   │   ├── src/components/
│   │   └── src/hooks/
│   └── server/                 # Node.js Fastify + Socket.io Server
│       ├── src/modules/auth/
│       ├── src/modules/game/
│       ├── src/modules/avatar/
│       └── src/socket/
├── packages/
│   ├── shared-types/           # Shared TypeScript interfaces & Zod schemas
│   └── database/               # Prisma schema & migrations
├── docker-compose.yml          # PostgreSQL & Redis containers
├── pnpm-workspace.yaml
└── package.json
```

## Related Code Files
- Create: `pnpm-workspace.yaml`
- Create: `package.json`
- Create: `docker-compose.yml`
- Create: `packages/shared-types/package.json`
- Create: `packages/shared-types/src/index.ts`
- Create: `packages/database/package.json`
- Create: `packages/database/prisma/schema.prisma`
- Create: `apps/web/package.json`
- Create: `apps/server/package.json`
- Create: `apps/server/src/server.ts`

## Implementation Steps
1. **Initialize Monorepo:** Configure `pnpm-workspace.yaml` and root `package.json` with scripts for `dev`, `build`, `test`, `lint`.
2. **Setup Database Schema:** Create Prisma schema in `packages/database` covering:
   - `User` (`id`, `email`, `nickname`, `passwordHash`, `role`, `createdAt`)
   - `Avatar` (`id`, `userId`, `color`, `hat`, `glasses`, `accessory`, `xpTotal`, `level`)
   - `GameSession` (`id`, `gameType`, `mode`, `boardSeed`, `status`, `startedAt`, `endedAt`)
   - `SessionParticipant` (`id`, `sessionId`, `userId`, `score`, `outcome`)
   - `GameResult` (`id`, `sessionId`, `userId`, `completionTimeMs`, `outcome`, `verifiedAt`)
   - `PersonalBest` (`id`, `userId`, `gameType`, `mode`, `bestValueMs`, `resultId`)
   - `XPTransaction` (`id`, `userId`, `resultId` [UNIQUE], `xpDelta`, `reason`, `createdAt`)
3. **Configure Shared Types:** In `packages/shared-types`, define Zod schemas and TypeScript types for:
   - Auth payloads (`RegisterDto`, `LoginDto`, `UserProfileDto`)
   - Solo Number Hunt payloads (`StartSoloDto`, `CompleteSoloDto`, `SoloResultDto`)
   - Real-time WebSocket events (`RoomCreate`, `RoomJoin`, `ClaimNumber`, `ClaimResult`, `GameStateSync`, `GameOver`)
4. **Setup Docker Compose:** Add PostgreSQL 16 and Redis 7 services with environment variables and persistent volume mounts.
5. **Setup Server Baseline:** Scaffold Fastify app with CORS, helmet, JWT plugin, and Socket.io instance listening on dedicated port/namespace.
6. **Setup Web Baseline:** Scaffold Next.js 15 app with Tailwind CSS, Lucide icons, and path aliases to `@repo/shared-types`.

## Success Criteria
- [ ] `docker compose up -d` successfully provisions PostgreSQL and Redis.
- [ ] `pnpm prisma migrate dev` creates all tables with proper foreign keys and unique constraints.
- [ ] `pnpm build` completes with zero TypeScript errors across all workspaces.
- [ ] Shared type packages can be imported cleanly in both `apps/web` and `apps/server`.

## Risk Assessment
- **Risk:** Windows environment issues with native node modules or path separators.
  - *Mitigation:* Use cross-platform tooling (pnpm, standard Node.js path resolvers, Docker).
- **Risk:** Schema mismatch between frontend forms and backend validation.
  - *Mitigation:* Single source of truth using Zod schemas in `packages/shared-types`.
