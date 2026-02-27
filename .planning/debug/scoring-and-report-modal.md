---
status: resolved
trigger: 'scoring-logic-and-report-modal-broken'
created: 2026-02-26T17:09:13Z
updated: 2026-02-26T17:15:00Z
---

## Resolution

root_cause: Settlement and hand persistence logic was only being called in the `processAction` callback. When a game reached the river and transitioned to showdown via a timer effect, the settlement code was skipped. This resulted in no winner being awarded (leading to a "DEFEAT" default in UI) and no hand record being added to Dexie (leading to a blank/broken Hand Report modal).
fix: 
- Moved settlement and Dexie persistence into a reactive `useEffect` in `GameController.tsx` that triggers whenever `stage === "SHOWDOWN"`.
- Added `totalBet` to the Player interface and state machine to accurately track contributions for profit calculation.
- Improved `RoundReportModal.tsx` robustness with defensive checks and a "No hands recorded" fallback.
verification: Added and verified regression tests for the specific failing scenario (Pair vs High Card). All 36 poker logic tests are passing.
files_changed: ["src/components/poker/GameController.tsx", "src/components/poker/RoundReportModal.tsx", "src/lib/poker/types.ts", "src/lib/poker/state-machine.ts", "src/lib/poker/betting.ts", "src/lib/poker/__tests__/regression.test.ts", "src/lib/poker/__tests__/evaluator.test.ts"]
