---
status: resolved
trigger: "Investigate issue: evaluate7-crash-at-preflop"
created: 2025-05-15T10:00:00Z
updated: 2025-02-26T10:00:00Z
---

## Current Focus

## Symptoms

expected: Hand should evaluate hand strength at any point (PREFLOP, FLOP, etc.) or just show hole card strength if <5 cards.
actual: `evaluate7` throws "Need at least 5 cards to evaluate" at src/lib/poker/evaluator.ts:38:11.
errors: Error: Need at least 5 cards to evaluate
reproduction: Navigate to /play (PREFLOP stage) or any stage with <5 cards total.
timeline: Started after custom evaluator implementation (Phase 7).

## Eliminated

## Evidence
- `src/lib/poker/evaluator.ts` contained a strict check: `if (cards.length < 5) { throw new Error('Need at least 5 cards to evaluate'); }`.
- UI calls `evaluateHand` during PREFLOP with only 2 cards.

## Resolution

root_cause: `evaluate7` strictly required 5 cards, but game logic calls it during PREFLOP/FLOP with <5 community cards.
fix: Removed the 5-card requirement guard and updated logic to handle 1-7 cards gracefully. Reconciled 'One Pair' vs 'Pair' naming mismatch.
verification: Added PREFLOP test cases in `evaluator.test.ts`. All 13 tests passed.
files_changed: ["src/lib/poker/evaluator.ts", "src/lib/poker/__tests__/evaluator.test.ts"]
