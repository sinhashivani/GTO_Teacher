# Research Summary: GTO Teacher

## 1. Poker Logic & Hand Evaluation
- **Library**: `@pokertools/evaluator` is the recommended choice for TypeScript. It's performant (16M+ evaluations/sec) and works in both Node and Browser.
- **GTO Logic**: Real-time GTO solvers (like `wasm-postflop`) are complex and some are unmaintained. For v1, we will use a **lookup-based strategy** using pre-defined strong baseline ranges (Expert mode) and simplified heuristics for Easy/Medium modes. This ensures local-first performance without needing a heavy WASM solver immediately.

## 2. Visual Style & UI Implementation
- **Framework**: Next.js + Tailwind CSS + shadcn/ui.
- **Pixel Aesthetic**:
  - **Fonts**: Use Google Fonts like `Press Start 2P` or local pixel fonts via `@font-face`.
  - **Tailwind**: Extend `fontFamily` with `pixel` and configure a custom color palette (`muted-gold`, `deep-green`).
  - **Components**: shadcn/ui components will be styled with pixel-perfect borders (e.g., `border-2` with no rounded corners) and the custom pixel font.
- **Compatibility**: Ensure components follow standard React/Tailwind patterns to maintain v0/Lovable compatibility.

## 3. Local-First Storage
- **Primary Choice**: **Dexie.js (IndexedDB)**.
- **Rationale**: Game history, session stats, and user settings are structured data. Dexie provides a clean, promise-based API and handles larger datasets better than LocalStorage.
- **Usage**: Store hand histories, win/loss records, and decision accuracy scores.

## 4. Deployment
- **Platform**: Vercel.
- **Next.js Features**: Use App Router for the main UI and API Routes for any future server-side logic (though v1 is local-first).
