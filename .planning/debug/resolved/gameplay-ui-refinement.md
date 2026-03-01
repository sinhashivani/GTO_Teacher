---
status: investigating
trigger: "Investigate and fix multiple issues related to gameplay consistency and NPC logic"
created: 2024-05-23T12:00:00Z
updated: 2024-05-23T12:00:00Z
---

## Current Focus

hypothesis: Multiple UI and logic issues in poker engine.
test: Manual code review and targeted fixes.
expecting: Unified hand names, better NPC rotation, all-in fixes, and UI improvements.
next_action: Investigate hand name consistency between ShowdownBanner and RoundReportModal.

## Symptoms

expected: 
- Consistent hand names (e.g. 'Ace High Card' in both popup and report).
- Immediate NPC replacement in 2-player games with a visual flicker.
- Smart NPC rotation based on profit/loss for 3+ players.
- 'Total Bet' displayed next to stack on seat.
- All-in players skip action and don't pay more.

actual: 
- Discrepancies in hand names.
- Hero can end up playing against nobody if the only bot leaves.
- Rotation logic needs polish.
- Total bet not displayed.
- All-in handling might be allowing negative balances or requiring action.

errors: none reported (logic/UI issues)
reproduction: Play a full session, go all-in, let bots cycle, and reach showdown with a High Card hand.
started: Ongoing feature refinement.

## Eliminated

## Evidence

## Resolution

root_cause: 
fix: 
verification: 
files_changed: []
