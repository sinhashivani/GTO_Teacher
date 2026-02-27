# CONTEXT: Gameplay Correctness & Post-Hand UX

## Goal
Fix core gameplay correctness (chip flow, showdown logic) and enhance post-hand UX (winner clarity, hand rankings UX, end of round report).

## User Decisions
### Locked Decisions
- Fix Chip Flow: `handleAction` MUST subtract from `stack` and add to `pot`. `initializeGame` MUST handle SB/BB chip deduction. `GameController` MUST persist stack updates to `bankroll` storage after every action.
- Fix Showdown Logic: Standardize high card cases to use `evaluate7` for all outcomes. Add regression tests for High Card, Pair, Two Pair, and Ties.
- Enhance Winner Clarity: Highlight 5-card winning hand and contributing community cards. Display a clear "WIN" or "DEFEAT" banner with the hand name.
- Improve Hand Rankings UX: Replace right-side panel with compact modal or tooltip. Add keyboard shortcut to open rankings guide.
- Add End of Round Report: Create modal/view summarizing the hand (board, hole cards, pot, winner). Include decision points where user deviated from GTO baseline with short explanations. Link end screen to this full report.
- Verification: Unit tests for chip accounting and showdown winner selection. Manual UAT checklist.
- Visuals: Maintain pixel tavern aesthetic. Do not reset in-progress hands.

### Deferred Ideas
- None mentioned.

### Claude's Discretion
- Modal/Tooltip implementation details for hand rankings.
- Visual style of the "WIN" or "DEFEAT" banner (within pixel tavern aesthetic).
- Exact format of the end of round report.
