# UAT: Phase 8 - Gameplay Correctness & Post-Hand UX

## Status
- **Session started:** 2026-02-26
- **Status:** TESTING

## Test Log
| ID | Test Case | Result | Notes |
|----|-----------|--------|-------|
| 1 | Chip Flow: Bet/Call Deduction | PASS | Player stack decreases by bet amount immediately. Pot increases. |
| 2 | Chip Flow: Pot Settlement | PASS | Winner receives pot, balance persists after refresh. Verified with unit tests. |
| 3 | Showdown: Accurate Winner | PASS | Verified via 5 regression tests including reported QQ vs 22 scenario. |
| 4 | Visual: Showdown Banner | PASS | "Victory" or "Defeat" banner with hand name. Dismissible via X. |
| 5 | Visual: 5-Card Highlight | PASS | Winning 5 cards highlighted on board and seat with glow/scale. |
| 6 | UI: Hand Ranking Modal | PASS | Opens with 'G' or floating button, shows card visuals for all 9 categories. |
| 7 | UI: Hand Report Modal | PASS | Opens with 'R' or button, navigable history, action log with optimal/deviation analysis. |
| 8 | Logic: Bot Quit | PASS | Bot leaves table with alert if bankroll drops below threshold (-500, -1000, -2000). |
| 9 | UI: "T" to "10" | PASS | Card rank displays as "10" for better player clarity. |

## Diagnosed Gaps
- 

## Fix Plans
- 
