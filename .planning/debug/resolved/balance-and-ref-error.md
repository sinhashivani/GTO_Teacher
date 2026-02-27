---
status: investigating
trigger: "ReferenceError: useEffect is not defined in AdviceCard.tsx and balance inconsistency between Lobby and Game Table."
created: 2025-05-14T10:00:00Z
updated: 2025-05-14T10:00:00Z
---

## Current Focus

hypothesis: useEffect is missing from imports in AdviceCard.tsx; Balance sync fails due to local state divergence or missing persistence.
test: Check imports in AdviceCard.tsx; Trace balance state from storage to UI in Lobby and Game Table.
expecting: Find missing import; Find where balance is updated but not persisted or read correctly.
next_action: gather initial evidence

## Symptoms

expected: 
- Playing an action should display coaching feedback without crashing.
- Balance on Lobby page should match the Game Table balance.
- Option to reset balance to 1000.
- Support for negative balances.

actual: 
- App crashes with useEffect is not defined in AdviceCard.tsx when an action is taken.
- Lobby and Game balances are out of sync.

errors: ReferenceError: useEffect is not defined at AdviceCard (src/components/poker/AdviceCard.tsx)
reproduction: Navigate to /play, take an action. Check balance on home page vs /play.
started: Ongoing.

## Eliminated

## Evidence

## Resolution

root_cause: 
fix: 
verification: 
files_changed: []