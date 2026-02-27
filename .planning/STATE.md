# Project State: GTO Teacher

## Current Phase: Phase 9 Complete
- **Status**: Phase 9 (Learning & Bankroll) complete. Engine hardened, coaching expanded.
- **Goal**: Final polish and delivery.

## Recent Updates
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
| Gameplay correctness & Post-hand UX polish | 2026-02-26 | DONE |
| All-in Logic & Expandable GTO Feedback | 2026-02-26 | DONE |
