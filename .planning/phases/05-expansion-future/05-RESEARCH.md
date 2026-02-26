# RESEARCH: Phase 5 - Expansion

## Overview
This phase expands the Heads-Up Preflop/Flop trainer into a 2-6 seat multi-street (Preflop through River) poker application with enhanced bot AI and persistence.

## 1. Multiplayer Logic (2-6 Seats)
- **Seat Management:** 
  - Positions: Dealer (D), Small Blind (SB), Big Blind (BB), Under the Gun (UTG), etc.
  - For 2 players (Heads-up): Dealer is SB. SB acts first preflop, BB acts first post-flop.
  - For 3+ players: SB is (D+1)%N, BB is (D+2)%N. UTG is (D+3)%N.
- **Turn Order:**
  - Preflop: First actor is UTG (seat after BB).
  - Post-flop: First actor is the first non-folded player starting from the seat after the Dealer (usually SB).
- **Pot Handling:** 
  - Multiple all-ins require side pot calculation. 
  - Logic: Sort all-in amounts. Calculate pot slices based on the smallest all-in. Players who contributed to a slice are eligible for it.

## 2. State Machine Extensions
- **Streets:** `PREFLOP` -> `FLOP` -> `TURN` -> `RIVER` -> `SHOWDOWN`.
- **Transitions:**
  - `transitionToTurn`: Deal 1 card, reset `currentBet` and `hasActed` for all players.
  - `transitionToRiver`: Deal 1 card, reset `currentBet` and `hasActed` for all players.
- **Winner Determination:** 
  - Use `pokersolver` (already in package.json) to evaluate best 5-card hand from 7 available (2 hole + 5 community).
  - Handle splits.

## 3. Bot AI Scaling
- Bots act sequentially. 
- Difficulty levels:
  - **Easy:** Simple heuristics (randomness, basic strength check).
  - **Medium:** Basic GTO/MDF (Minimum Defense Frequency) approximations.
  - **Expert:** Strategy lookup or advanced heuristics.
- Mixed mode: Assign different difficulty profiles to different seats.

## 4. Debug Panel & UAT
- **Debug Panel:** Floating overlay (dev only) displaying:
  - `currentStage`
  - `activePlayerIndex`
  - `pot` / `sidePots`
  - `lastAction`
  - `players` state (stack, bet, holeCards).
- **UAT Checklist:**
  - Verify turn order for 3, 4, 5, 6 players.
  - Verify side pot distribution for triple all-in.
  - Verify Turn/River card dealing.
  - Verify settings changes (e.g., coaching toggle) don't reset the hand.
  - Verify "Leave Game" forfeiture and history record.

## 5. Persistence (Dexie.js)
- Update `db.ts` to store `TableConfig` (seats, difficulty) and `HandHistory` (full action log).
- Ensure settings are loaded on mount.

## 6. Validation Architecture
- **Unit Tests:**
  - `engine.test.ts`: Test turn order for 3+ players.
  - `betting.test.ts`: Test side pot logic.
  - `state-machine.test.ts`: Test street transitions.
- **E2E/UAT:**
  - Manual verification of the Tavern UI with 6 players.
