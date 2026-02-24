# ROADMAP: GTO Teacher

## Phase 1: Scaffolding & Core Engine
**Goal:** Initialize the project scaffold, configure the pixel-art theme, and build the core poker logic engine.
**Plans:** 3 plans

Plans:
- [ ] 01-01-PLAN.md — Initialize Next.js, Tailwind, shadcn/ui, and configure pixel-art theme + Vercel deploy. [PH1-SCAFFOLD, PH1-THEME, PH1-DEPLOY]
- [ ] 01-02-PLAN.md — Implement Card/Deck logic and Hand evaluation engine. [PH1-LOGIC, PH1-EVAL]
- [ ] 01-03-PLAN.md — Implement Game State Machine and Betting logic for Preflop/Flop. [PH1-ENGINE]

## Phase 2: UI & Interaction
- [ ] Design and implement the "Tavern" game board.
- [ ] Create interactive player controls (Action buttons, sliders).
- [ ] Implement card animations and chip movements.
- [ ] Implement Coaching/Feedback timing toggles (Immediate vs. Delayed).
- [ ] Integrate local storage with Dexie.js for settings.

## Phase 3: Bot AI & Coaching Logic
- [ ] Implement Bot AI (Easy, Medium, Expert baselines).
- [ ] Develop the Recommendation system with rationale engine.
- [ ] Add "Opponent Insight" panels and hand helpers (Monte Carlo equity).
- [ ] Implement Hand History visibility toggle.

## Phase 4: Stats & Polish
- [ ] Build the Session Stats dashboard.
- [ ] Create Hand History viewer.
- [ ] Final visual polish and accessibility checks.
- [ ] Deploy to Vercel.

## Phase 5: Expansion (Future)
- [ ] Add Turn and River stages.
- [ ] Implement advanced GTO solver integration (WASM).
- [ ] Multi-street range analysis.
