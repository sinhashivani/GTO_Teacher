---
status: resolved
trigger: "Investigate issue: cannot-check-outstanding-bet"
created: 2024-05-14T10:00:00Z
updated: 2026-02-26T17:35:00Z
---

## Resolution

root_cause: The `GameController` UI was auto-triggering a `CHECK` action for Hero players whenever they were all-in (`stack === 0`), even if they were facing a bet they hadn't fully matched. The engine correctly threw an error because "checking" is illegal when there is an outstanding bet.
fix: 
- Refined `initializeGame` in `state-machine.ts` to return `-1` if no players have chips to act, preventing an all-in player from being mistakenly set as active.
- Removed the illegal Hero auto-check logic from `GameController.tsx`. The engine now correctly handles skipping all-in players, and the UI no longer sends unsolicited actions.
verification: Verified that all 36 logic and regression tests pass. Manual testing confirms the error no longer appears in the console.
files_changed: ["src/lib/poker/state-machine.ts", "src/components/poker/GameController.tsx"]
