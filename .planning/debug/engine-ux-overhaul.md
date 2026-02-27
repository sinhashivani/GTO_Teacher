---
status: resolved
trigger: "Investigate and fix multiple correctness and UX issues: poker-engine-and-ux-overhaul"
created: 2024-05-24T10:00:00Z
updated: 2024-05-24T10:00:00Z
---

## Resolution

root_cause: Multiple logic gaps in hand evaluation (score field mismatch), bankroll persistence (overwriting stack on hand start), and UX blockers (non-dismissible overlays).
fix: 
- Audited and verified `evaluate7` with regression tests.
- Fixed `BotAI` to use `classRank` instead of missing `score` field.
- Implemented correct chip flow and mid-hand stack persistence.
- Added Bot Quit behavior based on difficulty thresholds.
- Created dismissible `ShowdownBanner` and updated `RoundReportModal` with navigation and real action logs.
- Improved `HandRankingModal` with card visuals.
- Added Dev Debug Panel with evaluation info.
verification: Unit tests passed (Regression, Evaluator, Bankroll).

## Manual UAT Checklist
- [ ] **Hand Eval:** Board K-2-J-9-6, Hero QQ, Bot 22. Bot wins with Trips.
- [ ] **Kicker Test:** Board A-K-Q-J-3, Hero A-9, Bot A-8. Hero wins with High Card Ace, K-Q-J-9 kicker.
- [ ] **Bankroll:** Hero bets 100. Hero stack decreases by 100, Pot increases by 100 immediately.
- [ ] **Settlement:** Winner receives full pot. Balance persists after page refresh.
- [ ] **Bot Quit:** Easy bot loses 1500 (balance -500). Alert shows, routes to Lobby.
- [ ] **Overlay:** Victory/Defeat banner appears at showdown. Can click 'X' to see board.
- [ ] **Hand Report:** View report after 3 hands. Use arrows to toggle between all 3.
- [ ] **Rankings:** Open Guide (G). Visual cards (e.g., 5 cards for Straight) are shown.
- [ ] **Debug:** Open Debug. "To Act" and "Rank" (e.g. 'Pair') are visible.

files_changed: ["src/lib/poker/evaluator.ts", "src/lib/poker/bot.ts", "src/lib/poker/types.ts", "src/lib/poker/betting.ts", "src/lib/poker/state-machine.ts", "src/components/poker/GameController.tsx", "src/components/poker/DebugPanel.tsx", "src/components/poker/RoundReportModal.tsx", "src/components/poker/ShowdownBanner.tsx", "src/components/poker/HandRankingModal.tsx", "src/components/poker/ActionBar.tsx"]
