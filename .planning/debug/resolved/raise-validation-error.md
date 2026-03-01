---
status: investigating
trigger: "Investigate issue: raise-greater-than-current-bet-error"
created: 2024-05-15T12:00:00Z
updated: 2024-05-15T12:00:00Z
---

## Current Focus

hypothesis: Proportional raise calculation is producing a value that fails the "greater than current bet" validation.
test: Examine src/lib/poker/betting.ts and how raises are calculated and validated.
expecting: Find a logic error where the raise amount equals or is less than the current bet.
next_action: Read src/lib/poker/betting.ts

## Symptoms

expected: Raise should be valid and higher than the current max bet.
actual: Engine throws Error("Raise must be greater than current bet").
errors: src/lib/poker/betting.ts (56:15) @ handleAction
reproduction: User clicks Raise button on their turn.
started: Started after recent "Proportional Raise" changes.

## Eliminated

## Evidence

## Resolution

root_cause:
fix:
verification:
files_changed: []
