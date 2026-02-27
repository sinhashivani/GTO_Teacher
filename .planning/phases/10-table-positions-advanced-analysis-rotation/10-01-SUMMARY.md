# SUMMARY: 10-01 - Table Positions & Rotation

Implemented formal table position mapping (BTN, SB, BB, UTG, HJ, CO) for 2-6 players and hand-over-hand rotation in the engine.

## Completed Tasks
- **Update Types and Position Mapping Logic**: Added `Position` type and updated `Player` interface. Implemented `getPositionMapping` in `PokerGame`.
- **Unit Tests**: Added tests for 2, 3, and 6 player position mapping and dealer rotation. All tests passed.
- **Hand Rotation in GameController**: Updated `startHand` and `onNextHand` to track and increment `dealerIndex` across hands.

## Verification
- `npx tsx --test src/lib/poker/__tests__/engine.test.ts` - **PASS** (8 tests)
- Positions assigned: BTN, SB, BB, UTG, HJ, CO depending on player count.
- Dealer rotates clockwise each hand.
