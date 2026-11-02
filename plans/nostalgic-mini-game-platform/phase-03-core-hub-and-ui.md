---
phase: 3
title: "Core Hub and UI"
status: pending
priority: P1
dependencies: [1, 2]
---

# Phase 3: Core Hub and UI

## Overview
Develop the responsive Nostalgic Mini Game Hub, navigation structure, retro pixel/schoolyard aesthetic design system, audio engine for 8-bit sound effects, and user status bar showing player avatar, nickname, level, and XP progress bar.

## Requirements
- **Functional Requirements:**
  - `FR-HUB-01..03`: Responsive game catalog listing available games (Number Hunt with Solo & PvP highlighted; Caro and Memory Matching marked as "Coming Soon" or Extended).
  - Quick-start navigation: Launch into single-player or multiplayer lobby in $\le 2$ clicks.
  - User Status Header: Display authenticated avatar avatar thumbnail, level badge, and animated XP progression bar.
  - Sound effects toggle: Mute/unmute state persisted in localStorage.
- **Non-Functional Requirements:**
  - `NFR-UX-01..02`: Low friction, instant visual feedback on interactive buttons and hover states.
  - Mobile responsiveness: Adaptive layout for mobile phones, tablets, and widescreen desktop displays.
  - Modern accessibility: ARIA labels, keyboard navigability, high-contrast readable retro typography (e.g. `Press Start 2P` or `VT323` for accents, clean sans-serif like `Inter` for readability).

## Architecture

```
apps/web/src/
├── app/
│   ├── layout.tsx              # Global layout with Header, SoundController & AuthProvider
│   ├── page.tsx                # Main Mini Game Hub
│   ├── play/
│   │   └── number-hunt/
│   │       ├── page.tsx        # Number Hunt mode selector (Solo vs PvP)
│   │       ├── solo/page.tsx   # Solo play route
│   │       └── pvp/page.tsx    # PvP room route
│   └── profile/page.tsx        # Player profile, avatar customizer, records
├── components/
│   ├── hub/
│   │   ├── game-card.tsx       # Mini-game card with retro badges & CTA
│   │   └── quick-launch.tsx    # Instant launch modal / drawer
│   ├── layout/
│   │   ├── header.tsx          # Top bar with Avatar, Level, XP bar, Sound Toggle
│   │   └── retro-container.tsx # Schoolyard notebook / arcade frame wrapper
│   └── audio/
│       └── sound-manager.ts    # Web Audio / Howler synthesizer for retro SFX
```

## Related Code Files
- Create: `apps/web/src/components/layout/header.tsx`
- Create: `apps/web/src/components/layout/retro-container.tsx`
- Create: `apps/web/src/components/hub/game-card.tsx`
- Create: `apps/web/src/components/hub/game-grid.tsx`
- Create: `apps/web/src/lib/sound-effects.ts`
- Create: `apps/web/src/app/page.tsx`
- Create: `apps/web/src/app/globals.css`

## Implementation Steps
1. **Design System & Tailwind Configuration:**
   - Configure retro color palette (warm paper `#FAF7F2`, nostalgic blue `#2A5C9A`, arcade amber `#F59E0B`, chalkboard green `#1F4E38`).
   - Define custom retro border styles and button press states (3D bevel press effect).
2. **Audio Engine (`sound-effects.ts`):**
   - Synthesize or embed tiny retro audio samples using Web Audio API oscillators:
     - `click`: Short crisp pop (10ms square wave)
     - `correct`: Ascending chime (C5 -> G5)
     - `wrong`: Low buzz (150Hz sawtooth)
     - `victory`: Retro celebratory fanfare
     - `levelUp`: Arpeggiated chime
   - Provide global volume control and mute button.
3. **Mini Game Hub Layout:**
   - Banner highlighting the nostalgic theme ("Hồi Ức Học Trò - Schoolyard Nostalgia").
   - Responsive grid of game cards:
     - **Number Hunt (Tìm Số 1-25):** Active, badges for "Solo" & "PvP Realtime", "Play Now" button.
     - **Caro (Cờ Caro 5 Hàng):** "Beta / Coming Soon" badge.
     - **Memory Matching (Lật Hình):** "Coming Soon" badge.
4. **Player Status Bar:**
   - Integrate with `useAuth` hook:
     - Render active avatar portrait.
     - Display current level and XP counter (`145 / 200 XP`).
     - Smooth progress bar with animated glow on level up.

## Success Criteria
- [ ] Game Hub renders cleanly across viewport widths (375px mobile up to 4K desktop).
- [ ] Clicking sound toggle mutes and unmutes audio across navigation.
- [ ] Clicking "Play Number Hunt" navigates to the game screen within $< 1$ second without full page reload.
- [ ] Avatar preview in header accurately reflects database state.

## Risk Assessment
- **Risk:** Retro fonts impairing readability for dense game text.
  - *Mitigation:* Restrict pixel/retro fonts to headings, counters, and decorative badges; use clean system/Inter font for instructions and tables.
- **Risk:** Audio autoplay restrictions in modern browsers.
  - *Mitigation:* Audio context is unlocked on the first user interaction (click/touch).
