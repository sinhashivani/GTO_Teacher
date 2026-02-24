# PROJECT: GTO Teacher

## 1. Vision
A polished, local-first web app that teaches heads-up No-Limit Texas Hold’em (NLHE) by letting users play interactive hands against bots and learn GTO-style decision-making.

## 2. Core Features
- **Heads-up NLHE gameplay:** Preflop + Flop (v1), later adding Turn/River.
- **Difficulty Modes:** Easy, Medium, Expert.
- **Feedback Toggles:** 
  - Timing: Coaching after each action vs. only after hand.
  - Recommendation: Suggested action + short rationale (on/off).
  - Opponent Insights: Range estimation, likely hand categories/combos, bot hole cards.
- **Hand Helpers:** Hand category, best hands, outs, and basic equity estimates.
- **Session Stats:** Win rate, decision accuracy vs baseline, common leaks.
- **Local-first Storage:** Settings and history saved locally (no accounts).
- **Deployment:** Vercel.

## 3. Visual Direction & Style
- **Vibe:** Warm, cozy pixel-art tavern (soft lantern lights, green felt table).
- **Palette:** Muted gold + deep green.
- **UI:** 
  - Button sizing/spacing from RPG-style layouts.
  - "Advice cards" (compact, framed) sit on the edges of the screen.
  - Minimal HUD (pot, stacks, board, actions).
  - Collapsible panels for ranges/equity/combos.
- **Animations:** Smooth, subtle pixel animations (card deal/flip, chip movement).
- **Typography:** Pixel font for card ranks/suits and UI.

## 4. Tech Stack
- **Frontend:** Next.js (React + TypeScript)
- **Backend:** Local-first (Next.js API routes for future extensions)
- **Styling/UI:** Tailwind CSS + shadcn/ui
  - Custom pixel-style theme tokens.
  - v0/Lovable compatible component structures.
- **Deployment:** Vercel
