---
status: investigating
trigger: "bot-turn-stall"
created: 2025-05-15T10:00:00Z
updated: 2025-05-15T10:00:00Z
---

## Current Focus

hypothesis: Turn progression logic in Phase 5 implementation has a flaw preventing bot turns from triggering.
test: Examine state-machine.ts and bot.ts to see how turns are triggered and if the bot logic is being called.
expecting: Identify a missing transition or a check that fails for bots.
next_action: Examine src/lib/poker/state-machine.ts and src/lib/poker/bot.ts.

## Symptoms

expected: Bot should act when it is their turn (player's activePlayerIndex).
actual: After player action, the bot never triggers its turn and the hand stalls.
errors: No console errors reported, but turn progression is failing to trigger bot turns.
reproduction: Start a 2+ player game, take an action as Hero, notice the bot does not act.
started: Started after implementing Phase 5 (Multiplayer & multi-street expansion).

## Eliminated

## Evidence

## Resolution

root_cause: 
fix: 
verification: 
files_changed: []
