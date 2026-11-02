---
phase: 7
title: "Hardening Deployment and Playtesting"
status: pending
priority: P1
dependencies: [1, 2, 3, 4, 5]
---

# Phase 7: Hardening Deployment and Playtesting

## Overview
Perform end-to-end automated testing (Playwright), security and anti-cheat audit, production deployment on cloud infrastructure (Frontend on Vercel/Cloudflare, Backend & WebSockets on Railway/Fly.io, PostgreSQL on Supabase/Neon), and execute the real-user playtesting protocol targeting 50–100 student participants to validate the core hypotheses (Nostalgia, Replayability, Return visits).

## Requirements
- **Functional Requirements:**
  - Automated test suite covering Solo gameplay, concurrent PvP moves, and idempotent XP award.
  - Production deployment accessible via public URL with SSL certificate.
  - Analytics & logging for usability evaluation: track steps to start, match completion rate, and Play Again button usage.
  - Structured user testing survey and feedback collection.
- **Non-Functional Requirements:**
  - Production uptime and resilience during concurrent room play.
  - Zero sensitive secrets committed to Git repository.
  - Fast page loading: Core Web Vitals (LCP $< 2.5$s, FID $< 100$ms, CLS $< 0.1$).

## Architecture & Deployment Topology

```
                  ┌───────────────────────────────┐
                  │       Custom Domain / DNS     │
                  │   (e.g. nostalgic-game.app)   │
                  └──────────────┬────────────────┘
                                 │
                 ┌───────────────┴──────────────┐
                 │                              │
                 ▼                              ▼
      ┌────────────────────┐         ┌────────────────────┐
      │  Vercel Edge / CDN │         │  Railway / Fly.io  │
      │  Next.js 15 Web UI │         │  Fastify + WSS App │
      └──────────┬─────────┘         └──────────┬─────────┘
                 │                              │
                 └──────────────┬───────────────┘
                                │
                 ┌──────────────┴──────────────┐
                 │                             │
                 ▼                             ▼
      ┌────────────────────┐        ┌────────────────────┐
      │  Managed Postgres  │        │   Managed Redis    │
      │  (Supabase / Neon) │        │ (Upstash / Railway)│
      └────────────────────┘        └────────────────────┘
```

## Related Code Files
- Create: `apps/web/e2e/solo-game.spec.ts`
- Create: `apps/web/e2e/pvp-concurrency.spec.ts`
- Create: `apps/server/src/test/xp-idempotence.test.ts`
- Create: `.github/workflows/ci.yml`
- Create: `.github/workflows/deploy.yml`
- Create: `docs/playtesting_protocol.md`
- Create: `docs/user_survey_questions.md`

## Implementation Steps
1. **Automated Testing Suite:**
   - **Playwright E2E:**
     - Test 1: Full Solo run clicking 1 to 25 sequentially; assert timer stops and result modal displays personal best.
     - Test 2: Two concurrent browser contexts joining the same PvP room; simultaneous click on cell 1; assert one gets +1 score, other gets rejected, game ends at 25 points.
   - **Unit & Integration Tests (Vitest):**
     - Verify XP leveling formula edge cases.
     - Verify idempotent rejection when same `resultId` is submitted twice.
2. **Security & Anti-Cheat Hardening:**
   - Run security audit (`npm audit` / dependency review).
   - Rate limiting on API routes (100 req/min per IP via `@fastify/rate-limit`).
   - CORS origin whitelist restricting WebSocket connections to production domain.
3. **CI/CD & Cloud Deployment:**
   - Setup GitHub Actions workflow to run type-checking, linter, and tests on every pull request.
   - Deploy `apps/web` to Vercel with environment variables for backend API and WebSocket endpoints.
   - Deploy `apps/server` to Railway / Fly.io with Dockerfile and persistent WebSocket support.
   - Provision managed PostgreSQL and run Prisma migration in CI/CD pipeline.
4. **User Playtesting Playbook (50–100 Users):**
   - Protocol document:
     - Step 1: Onboard player via quick link without app install.
     - Step 2: Measure initial time-to-first-click (target $< 10$ seconds).
     - Step 3: Record voluntary "Play Again" clicks per participant.
     - Step 4: Survey questions (5-point Likert scale):
       1. "Tôi chọn thử game này vì nó gợi lại trò chơi tuổi thơ quen thuộc" (Nostalgia hypothesis).
       2. "Tôi cảm thấy các ván chơi đủ nhanh, dễ hiểu và không tốn nhiều thời gian chờ đợi" (Quick-play hypothesis).
       3. "Việc tích luỹ điểm XP, nâng cấp level và đổi diện mạo avatar khiến tôi muốn quay lại chơi tiếp" (Retention hypothesis).
       4. "Tôi có muốn chia sẻ kết quả thi đấu với bạn bè không?" (Sharing hypothesis).

## Success Criteria
- [ ] All Playwright E2E tests pass reliably in CI pipeline.
- [ ] Public website is live, responsive on both iOS Safari and Android Chrome, with working WebSockets.
- [ ] 50–100 student playtest sessions executed and telemetry logged.
- [ ] Summary report generated analyzing player feedback, retention rates, and hypothesis validation.

## Risk Assessment
- **Risk:** Free-tier hosting sleeping or cold starts causing high WebSocket connection latency.
  - *Mitigation:* Use continuous ping / healthcheck cron or upgrade to lowest dedicated tier for the duration of the testing week.
- **Risk:** Low test user turnout.
  - *Mitigation:* Organize an on-campus mini-tournament among FPT University student groups with shareable room codes.
