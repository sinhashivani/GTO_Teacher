# Project State: GTO Teacher

## Current Phase: Phase 10 Complete
- **Status**: Phase 10 (Table Positions, Advanced Analysis, Rotation) complete.
- **Goal**: Final polish and delivery.

## Recent Updates
- **Phase 10 (Advanced Rotation & Analysis) Completed**:
  - Implemented formal table positions (BTN, SB, BB, UTG, HJ, CO) for 2-6 players.
  - Added dealer rotation hand-over-hand in `GameController`.
  - Implemented Secure Card Reveal: Opponent hole cards are shown if Hero folds.
  - Added Advanced GTO Metrics: Action scores, EV Delta, and identified Leaks (e.g., "Over-folding on PREFLOP").
  - Implemented Dynamic Bot Rotation: Bots leave the table at credit thresholds and are refilled after 1-3 hands.
  - Created Bot Inspection Modal showing skill profile, play style, and last 5 "characteristic" actions.
- **Phase 9 (Learning & Bankroll) Completed**:
  - Implemented Bankroll Resets and custom Starting Stacks.
  - Added "Credit Mode" for negative betting down to configurable limits.
  - Expanded GTO Coaching with structured "Why" and "What Changes" explanations.
  - Added a Learning Glossary for core poker terminology.
  - Hardened engine security by masking opponent hole cards until showdown.
  - Improved settings stability by buffering changes between hands.
- **Phase 6 (Optimization) Completed**:
  - Decoupled synchronous engine transitions from UI rendering using async effects and `setTimeout`.
  - Implemented visual action feedback (badges) during street transitions.
  - Hardened turn order logic for both Heads-up and Multiplayer modes in `state-machine.ts`.
  - Synchronized Bot AI with the new asynchronous street flow to eliminate race conditions.
- **Phase 5 (Expansion) Completed**:
  - Implemented 2-6 seat multiplayer logic and turn order.

## Next Steps
1. Execute `06-01-PLAN.md` to refactor synchronous street transitions to async.
2. Execute `06-02-PLAN.md` to audit turn order and synchronize Bot AI.
3. Final polish and deployment.

## Quick Tasks Completed
| Task | Date | Status |
|------|------|--------|
| NPC Rotation & UI Refinement (Immediate refill in HU, flicker effect, total bet display, all-in auto-call) | 2026-02-27 | DONE |
| Persistent Actions & Enhanced Winner Reporting (Multi-player support, Winning card lists) | 2026-02-27 | DONE |
| Proportional Raise Amounts (1/3, 1/2, 2/3, POT presets) | 2026-02-27 | DONE |
| NPC & Betting Overhaul (30 NPCs, Exit Thresholds, Strict Limits, Slider Fix) | 2026-02-27 | DONE |
| Gameplay correctness & Post-hand UX polish | 2026-02-26 | DONE |
| All-in Logic & Expandable GTO Feedback | 2026-02-26 | DONE |
