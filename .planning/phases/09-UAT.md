# UAT: Phase 9 - Learning & Bankroll Features

## Status
- **Session started:** 2026-02-26
- **Status:** PASS

## Test Log
| ID | Test Case | Result | Notes |
|----|-----------|--------|-------|
| 1 | Bankroll Resets | PASS | "Reset Mine" and "Reset All" buttons work with confirmation. |
| 2 | Starting Stack Config | PASS | Can set starting stack (100-5000) applied to new hands. |
| 3 | Credit Mode Betting | PASS | When ON, Hero can bet down to the configurable limit (e.g., -2000). |
| 4 | Bot Credit Limits | PASS | Bots fold/shove correctly at difficulty-based credit thresholds. |
| 5 | Security: Hole Cards | PASS | Opponent hole cards are masked in the browser state until showdown. |
| 6 | Stable Settings | PASS | Difficulty/Player Count changes are buffered and apply only between hands. |
| 7 | GTO Coaching | PASS | Advice cards show detailed "Why", "What changes", and "Alternatives". |
| 8 | Learning Glossary | PASS | Popup glossary with core terms accessible from top bar and hand report. |
| 9 | Round Report | PASS | Reports now show full Action Analysis with structured GTO breakdown. |

| 10 | Logic: Credit Mode End Round | PASS | Round correctly ends when all-in at credit limit. skip players with no credit. |

## Diagnosed Gaps
- Refactored GameController to move bankroll side-effects out of state updates to prevent UI-triggered engine errors.
- Hardened Credit Mode logic in betting engine to correctly identify "all-in" as hitting the credit limit.

## Fix Plans
- N/A
