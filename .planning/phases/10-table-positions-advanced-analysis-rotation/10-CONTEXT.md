# Phase 10: Table Positions, Advanced Analysis, & Dynamic Rotation

## Goal
Implement correct table positions (2-6 players), rotation, advanced GTO metrics, bot inspection (after Hero fold), and dynamic bot rotation/refill.

## Key Deliverables

### 1. Table Positions & Blinds
- Position assignment: BTN, SB, BB, UTG, HJ, CO mapping for 2-6 players.
- Rotation logic: dealerIndex increments each hand.
- Engine update: `initializeGame` handles all positions correctly.
- UI: Position labels on `PlayerSeat` (toggleable).
- Tests: Unit tests for rotation and action order (2-6 players).

### 2. Tavern Mode GTO Analysis
- Hero Metrics: Accuracy, EV delta estimate, recurring leaks.
- UI: Compact status badge during play, detailed section in `RoundReportModal`.
- Persistence: Session stats tracking.

### 3. Bot Performance & Inspection
- Bot Modal: Performance panel showing actions vs skill profile.
- Card Reveal Logic: Only show bot cards if Hero has folded (enforce in `publicState`).

### 4. Dynamic Bot Rotation
- Quit logic: Bots leave if bankroll < threshold.
- Refill logic: New bot joins after 1-3 hands.
- Weighted selection: Maintain skill diversity (expert/medium/easy).
- Persistence: Keep bot IDs/skills consistent in session state.

### 5. UX & Verification
- All modals dismissible, non-resetting.
- Manual UAT for rotation, reveal logic, and refill behavior.

## Decisions
- (Locked) Table positions must support 2-6 players with correct blind mapping (Heads-up: SB is BTN).
- (Locked) Bot cards reveal ONLY if Hero is folded or hand is over.
- (Claude's Discretion) EV delta estimate methodology (simple bucketed approximation is fine).
- (Claude's Discretion) Bot refill delay (1-3 hands) can be randomized.

## Deferred Ideas
- Multi-table support (Deferred).
- Advanced GTO solver integration (using simple logic/heuristics for now).
