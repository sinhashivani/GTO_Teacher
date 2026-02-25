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
- [ ] Add Turn and River stages.
- [ ] Implement advanced GTO solver integration (WASM).
- [ ] Multi-street range analysis.
