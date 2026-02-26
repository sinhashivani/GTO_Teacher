# ROADMAP: GTO Teacher

## Phase 1: Scaffolding & Core Engine
**Goal:** Initialize the project scaffold, configure the pixel-art theme, and build the core poker logic engine.
**Plans:** 3 plans

Plans:
- [ ] 01-01-PLAN.md — Initialize Next.js, Tailwind, shadcn/ui, and configure pixel-art theme + Vercel deploy. [PH1-SCAFFOLD, PH1-THEME, PH1-DEPLOY]
- [ ] 01-02-PLAN.md — Implement Card/Deck logic and Hand evaluation engine. [PH1-LOGIC, PH1-EVAL]
- [ ] 01-03-PLAN.md — Implement Game State Machine and Betting logic for Preflop/Flop. [PH1-ENGINE]

## Phase 2: UI & Interaction
**Goal:** Design and implement the "Tavern" game board and player controls.
**Plans:** 4 plans

Plans:
- [x] 02-01-PLAN.md — Design and implement the "Tavern" game board layout and player seats. [PH2-LAYOUT]
- [x] 02-02-PLAN.md — Implement interactive player controls (Action buttons, sliders). [PH2-CONTROLS]
- [x] 02-03-PLAN.md — Implement card animations and chip movements. [PH2-VISUALS]
- [x] 02-04-PLAN.md — Integrate local storage with Dexie.js for settings and session history. [PH2-STORAGE]

## Phase 3: Bot AI & Coaching Logic
**Goal:** Implement Bot AI, recommendation engine, and insights.
**Plans:** 3 plans

Plans:
- [x] 03-01-PLAN.md — Implement Bot AI baselines (Easy, Medium, Expert). [PH3-BOT]
- [x] 03-02-PLAN.md — Develop the Recommendation system with rationale engine. [PH3-COACHING]
- [x] 03-03-PLAN.md — Add hand helpers and opponent insight panels. [PH3-INSIGHTS]

## Phase 4: Stats & Polish
**Goal:** Build the Session Stats dashboard, history viewer, and final polish.
**Plans:** 3 plans

Plans:
- [x] 04-01-PLAN.md — Create the Session Stats dashboard. [PH4-STATS]
- [x] 04-02-PLAN.md — Implement the Hand History viewer. [PH4-HISTORY]
- [x] 04-03-PLAN.md — Final visual polish and responsiveness. [PH4-POLISH]

## Phase 5: Expansion (Future)
**Goal:** Expand to 2-6 seats, Turn/River streets, and enhanced bot/coaching logic.
**Status:** COMPLETE

Plans:
- [x] 05-01-PLAN.md — Engine & Types expansion (Multiplayer, Side Pots). [PH5-ENGINE]
- [x] 05-02-PLAN.md — Bot AI & Coaching scaling. [PH5-BOTS]
- [x] 05-03-PLAN.md — UI Updates & Debug Panel. [PH5-UI]
- [x] 05-04-PLAN.md — Persistence & Leave Game logic. [PH5-PERSISTENCE]
- [x] 05-05-PLAN.md — Final Verification & UAT. [PH5-VERIFY]

### Phase 6: Fix engine synchronization and UI stalls

**Goal:** Resolve asynchronous execution stalls and ensure UI synchronization during street transitions.
**Depends on:** Phase 5
**Plans:** 2 plans

Plans:
- [ ] 06-01-PLAN.md — Async Street Transitions & Action Display [PH6-TRANSITION]
- [ ] 06-02-PLAN.md — Turn Order & Bot AI Sync [PH6-ENGINE]
