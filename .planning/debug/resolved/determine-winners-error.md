---
status: investigating
trigger: "ReferenceError: determineWinners is not defined"
created: 2024-12-05T14:00:00Z
updated: 2024-12-05T14:00:00Z
---

## Current Focus

hypothesis: Missing import or incorrect name for determineWinners in RoundReportModal.tsx
test: Check imports and usage of determineWinners in RoundReportModal.tsx
expecting: Either missing import from lib/poker/settlement.ts or changed function name
next_action: Examine RoundReportModal.tsx

## Symptoms

expected: RoundReportModal should open and display hand results.
actual: App crashes with ReferenceError when the modal is opened.
errors: determineWinners is not defined
reproduction: Open the Hand Report modal after playing a hand.
started: Started after the most recent Engine/UX overhaul.

## Eliminated

## Evidence

## Resolution

root_cause:
fix:
verification:
files_changed: []
