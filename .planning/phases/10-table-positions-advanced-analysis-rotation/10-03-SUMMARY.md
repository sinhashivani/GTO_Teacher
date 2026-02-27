# SUMMARY: 10-03 - Advanced GTO Metrics & Persistence

Updated BotAI to provide action scores and implemented persistence for advanced GTO metrics (Accuracy, EV Delta, Leaks).

## Completed Tasks
- **Action Scores**: Updated `BotAI` to return weights for all legal actions. Added `scores` field to `Action` interface.
- **Advanced Metrics**: Implemented calculation of `evDelta` (Hero's score vs best score) and identified leaks (e.g., "Over-folding on PREFLOP").
- **Persistence**: Updated `db.ts` to version 7, adding `evDelta` and `leaks` to the `HandHistory` schema.
- **Reporting**: Added a "GTO Performance" section to `RoundReportModal.tsx` showing accuracy, EV loss, and a list of identified leaks for each hand.

## Verification
- `HandHistory` now stores average EV loss and leak strings.
- Round Report correctly displays metrics for the current hand being viewed.
- Leaks are logically categorized by street and action type.
