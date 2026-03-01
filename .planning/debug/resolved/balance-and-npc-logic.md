---
status: investigating
trigger: "Investigate and fix multiple engine and UI issues: 1. Incorrect balance updates for negative balances (Credit Mode). 2. Unexpected opponent balance resets. 3. Missing NPC names/identities for new joining opponents. 4. Imprecise winning hand feedback and card highlighting."
created: 2025-05-15T10:00:00Z
updated: 2025-05-15T10:00:00Z
---

## Current Focus

hypothesis: Multiple logic errors in balance calculation, bot initialization, and showdown evaluation.
test: Reviewing code and running tests.
expecting: To find specific bugs in state-machine.ts, bankroll.ts, bot.ts, and evaluator.ts.
next_action: Examine balance update logic in state-machine.ts and bankroll.ts.

## Symptoms

expected: 
- Betting with negative balance makes it more negative.
- Bot balances persist correctly across hands or transfers.
- New bots use names from the Tavern NPC pool.
- Showdown highlights only relevant cards and describes the hand accurately (e.g., "Ace High Card").

actual:
- Balances update "weirdly" (positive instead of more negative).
- Opponent balances reset.
- Opponents are "random" instead of named Tavern NPCs.
- Showdown feedback/highlighting is not specific enough.

errors: none
reproduction: Play in Credit Mode, let bots cycle, and check showdowns.
started: Post-Phase 10 / Quick Task.

## Eliminated

## Evidence

## Resolution

root_cause: 
fix: 
verification: 
files_changed: []