---
status: investigating
trigger: "The poker engine debug state shows the bot should act, but the UI doesn't reflect any move, the round doesn't progress (no cards dealt), and the logic seems suboptimal."
created: 2025-02-21T11:00:00Z
updated: 2025-02-21T11:00:00Z
---

## Current Focus

hypothesis: Initial investigation - gathering evidence on why the bot doesn't act and why the round doesn't progress.
test: N/A
expecting: N/A
next_action: Examine state-machine.ts and bot.ts to understand turn handling and AI logic.

## Symptoms

expected: Board should show bot moves (raise/call), rounds should progress to next street (Flop/Turn/River) after actions are complete, and bot logic should be GTO-aligned.
actual: Debug state: PREFLOP, Active Player: 1 (bot-1), You (Hero) acted but bot hasn't moved visually. Cards not dealt after round.
errors: Debug panel mismatch between internal state and visual board.
reproduction: 
- Stage: PREFLOP
- Hero (You): Stack 960, Bet 40, Acted YES
- Bot (Drunk Bard #1): Stack 980, Bet 20, Acted NO
- Bot should be facing a raise/bet and should act, but board is static.
started: Observed after Phase 5 expansion.

## Eliminated

## Evidence

## Resolution

root_cause: 
fix: 
verification: 
files_changed: []
