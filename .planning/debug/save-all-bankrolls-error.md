---
status: investigating
trigger: "Investigate issue: saveAllBankrolls-reference-error"
created: 2024-05-22T10:00:00Z
updated: 2024-05-22T10:00:00Z
---

## Current Focus

hypothesis: saveAllBankrolls is called in GameController.tsx but not imported or defined.
test: Search for saveAllBankrolls in GameController.tsx and other files.
expecting: Find a call site in GameController.tsx and a missing export/import or a typo.
next_action: Search for "saveAllBankrolls" in the codebase.

## Symptoms

expected: Player stacks should update and persist after every action without crashing.
actual: Game crashes with ReferenceError immediately after the first action.
errors: ReferenceError: saveAllBankrolls is not defined
reproduction: Start a game and take any action (e.g., CALL).
started: Started after "Gameplay correctness & Post-hand UX polish" quick task.

## Eliminated

## Evidence

- timestamp: 2024-05-22T10:05:00Z
  checked: src/components/poker/GameController.tsx imports and src/lib/poker/bankroll.ts exports.
  found: saveAllBankrolls is exported in bankroll.ts but NOT imported in GameController.tsx.
  implication: This is the cause of the ReferenceError.

## Resolution

root_cause: saveAllBankrolls was used in processAction() and showdown settlement logic in GameController.tsx but was never imported from @/lib/poker/bankroll.
fix: Added saveAllBankrolls to the import list from @/lib/poker/bankroll in GameController.tsx.
verification: Manually confirmed that saveAllBankrolls is exported in bankroll.ts and now correctly imported in GameController.tsx. Verified there are no other missing imports for bankroll functions.
files_changed: ["src/components/poker/GameController.tsx"]
