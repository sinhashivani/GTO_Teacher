# SUMMARY: Phase 5, Plan 01 - Engine & Types

## Accomplishments
- Expanded `GameState` and `Player` types to support multiplayer and side pots.
- Refactored `PokerGame` class to support 2-6 players with correct dealer/SB/BB assignments.
- Implemented `getNextToAct` logic in `betting.ts` for sequential turn order in multiplayer.
- Added `calculateSidePots` logic to handle multi-way all-ins.
- Extended state machine to handle Turn and River transitions.

## Verification
- Passing unit tests in `engine.test.ts` for 2 and 3 player games.
- Verified street transitions from Preflop to River.
