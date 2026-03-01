---
status: investigating
trigger: "hole-cards-flicker"
created: 2024-05-20T10:00:00Z
updated: 2024-05-20T10:00:00Z
---

## Current Focus

hypothesis: Hole cards are being re-derived or regenerated in a render loop or due to state updates that trigger deck reshuffling/card assignment.
test: Examine how hole cards are assigned in the game state and how they are rendered in components.
expecting: Finding a place where hole cards are not memoized or where the source of cards (the deck or game state) is being reset/updated too frequently.
next_action: Examine src/app/play/page.tsx and related components (PokerTable, PlayerSeat).

## Symptoms

expected: Hole cards should be assigned once per round and remain static until the next hand.
actual: Hole cards flicker repeatedly while playing (regenerating).
errors: none
reproduction: Open localhost:3000/play and start a hand.
started: Started after recent Phase 10 changes (Bot Rotation/SessionPlayers).

## Eliminated

## Evidence

## Resolution

root_cause: 
fix: 
verification: 
files_changed: []