---
status: investigating
trigger: "Investigate and fix multiple gameplay and UI issues: 1. Blinds subtraction, 2. Scale blinds, 3. Raise buttons, 4. Slider track click, 5. GTO AdviceCard, 6. 0 balance loop, 7. Seating glossary."
created: 2024-05-22T10:00:00.000Z
updated: 2024-05-22T10:00:00.000Z
---

## Current Focus

hypothesis: Multiple gameplay and UI regressions or missing features.
test: Investigating each of the 7 listed points.
expecting: Identify and fix issues in blinds, scaling, UI components, and logic.
next_action: Investigate blinds subtraction and scaling.

## Symptoms

expected: Balance reduces for blinds; Blinds scale; GTO popup shows; Exit on 0 balance; Glossary updated.
actual: Blinds not reducing (or being overwritten); Blinds are static 10/20; GTO popup missing; No 0-balance loop.
errors: none reported
reproduction: Open /play, start hands, observe balance and blinds.
started: Regression or missing features after Phase 10.

## Eliminated

## Evidence

- timestamp: 2024-05-22T10:00:00.000Z
  checked: initial state
  found: symptoms prefilled
  implication: skipping symptom gathering

## Resolution

root_cause: 
fix: 
verification: 
files_changed: []
