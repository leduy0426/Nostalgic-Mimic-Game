---
phase: 6
title: "Extended Features"
status: pending
priority: P2
dependencies: [1, 2, 4, 5]
---

# Phase 6: Extended Features

## Overview
Implement the prioritized Extended MVP features: Shareable Achievement Card (client-side Canvas export with zero private data disclosure), turn-based Caro 5-in-a-row PvP, Memory Matching Solo mode, and virtual coin rewards with basic cosmetic shop.

## Requirements
- **Functional Requirements:**
  - `FR-SHARE-01..02 / NFR-PRIV-01`: Generate a visual achievement badge / card including public nickname, avatar appearance, game title, record / match result, and timestamp. Strictly exclude emails, internal database IDs, or private data. Support one-click PNG download or clipboard copy.
  - `FR-CARO-01`: Turn-based 2-player Caro (15x15 grid, standard 5-in-a-row win condition, turn timer 30s).
  - `FR-MEM-01`: Memory Matching Solo (4x4 grid of 8 nostalgic school item pairs: eraser, pencil, notebook, shuttlecock, chalk, marble, ruler, compass; track completion time & moves).
  - `FR-COIN-01`: Award virtual coins on match completion (1 coin per 5 XP); basic shop to unlock avatar cosmetic items (hats, sunglasses, hair styles).
- **Non-Functional Requirements:**
  - Zero server load for card generation (generate client-side via HTML5 Canvas or SVG).
  - Privacy compliance: Explicit user action required to export or copy card.

## Architecture

```
apps/web/src/components/
├── share/
│   ├── achievement-card.tsx      # Visual retro postcard / certificate layout
│   └── card-exporter.ts          # Canvas rendering & Blob download utility
├── caro/
│   ├── caro-board.tsx            # 15x15 Canvas / SVG interactive grid
│   └── caro-logic.ts             # 5-in-a-row direction checker (horizontal, vertical, diagonals)
├── memory/
│   ├── memory-board.tsx          # 4x4 card flip grid with CSS 3D transforms
│   └── card-items.ts             # Nostalgic icon set
└── shop/
    ├── cosmetic-store.tsx        # Avatar accessories catalog
    └── purchase-modal.tsx        # Coin spending confirmation
```

## Related Code Files
- Create: `apps/web/src/components/share/achievement-card.tsx`
- Create: `apps/web/src/components/share/card-exporter.ts`
- Create: `apps/web/src/app/play/caro/page.tsx`
- Create: `apps/web/src/components/caro/caro-board.tsx`
- Create: `apps/server/src/socket/caro.handler.ts`
- Create: `apps/web/src/app/play/memory/page.tsx`
- Create: `apps/web/src/components/memory/memory-board.tsx`
- Create: `apps/web/src/app/shop/page.tsx`

## Implementation Steps
1. **Shareable Achievement Card:**
   - Design an editorial, nostalgic certificate layout (warm paper background, retro stamp, player avatar render, formatted record: e.g. "Number Hunt Solo - 18.42s - Kỷ Lục Gia").
   - Use `html-to-image` or native Canvas API to export a high-res $1200 \times 630$ PNG optimized for Zalo/Facebook/Discord sharing.
   - Add "Lưu Ảnh (Save Image)" and "Sao Chép Ảnh (Copy to Clipboard)" buttons.
2. **Caro 5-in-a-row Multiplayer:**
   - 15x15 board state represented as 2D array.
   - Server-side move validation checking that selected cell is empty and it is the player's turn.
   - Efficient win detection checking 4 axes (horizontal, vertical, diagonal-up, diagonal-down) for contiguous sequence of 5 marks.
3. **Memory Matching Solo:**
   - 16 cards (8 pairs of childhood schoolyard illustrations).
   - Flip animation using CSS `transform: rotateY(180deg)`.
   - Track flip count and completion time.
4. **Cosmetic Store & Virtual Coins:**
   - Coins table and inventory table in database.
   - Catalog: 4 hats (Mũ ca-lô học sinh, Mũ lưỡi trai retro, Tai thỏ, Mũ phù thủy), 3 glasses, 5 palette colors.
   - Instant live avatar preview when trying on items in the shop.

## Success Criteria
- [ ] Clicking "Chia Sẻ Kỷ Lục" exports a crisp PNG file containing the player's avatar and verified score without revealing sensitive data.
- [ ] Caro game reliably detects 5-in-a-row win and rejects invalid moves or clicks outside active turn.
- [ ] Memory game card matching works smoothly with sound effects on match and mismatch.
- [ ] Purchasing a cosmetic item deducts coins and equips the item to the avatar immediately.

## Risk Assessment
- **Risk:** High scope pressure jeopardizing the 4–8 week project delivery.
  - *Mitigation:* Explicit gating: Core MVP (Phases 1–5) must be 100% completed and tested before starting Phase 6 features. Phase 6 items can be delivered progressively.
