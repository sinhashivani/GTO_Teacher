# QUICK PLAN: Gameplay Fix & UX Polish

## 1. Chip Flow & Persistence
- [ ] Update `GameController.processAction` to persist all player stacks to `bankroll` after every action.
- [ ] Fix `PokerGame.initializeGame` to ensure blind payments are consistent with `handleAction` (already seems okay, but will verify).
- [ ] Ensure `onNextHand` correctly initializes the next state with persistent stacks.

## 2. Showdown & Evaluator
- [ ] Add regression tests to `src/lib/poker/__tests__/evaluator.test.ts` for:
  - High Card vs High Card (Lexicographical)
  - Pair vs High Card
  - Two Pair vs Two Pair
  - Ties (Split Pot)
- [ ] Verify `evaluate7` never returns `'One Pair'` (already fixed, but checking again).

## 3. Winner Clarity & Highlighting
- [ ] Update `ActionBar` or `TavernLayout` to show a large "WIN" or "DEFEAT" banner at showdown.
- [ ] Improve `PlayerSeat` and `CommunityCards` highlighting logic to ensure the winning 5-card hand is unmistakably clear.
- [ ] Ensure highlights use `tavern-gold` and are legible.

## 4. Hand Patterns Guide UX
- [ ] Remove `HandGuide` from `RightDrawerPanel`.
- [ ] Create `HandRankingModal` (compact, pixel-art style).
- [ ] Add a floating "Book" button near the `ActionBar` and/or a keyboard shortcut ('G') to open it.

## 5. End of Round Report
- [ ] Create `RoundReport` component/modal.
- [ ] Capture "deviations" during the hand in `GameState` or a separate ref.
- [ ] Show board, final hole cards, pot, and GTO optimality summary.

## Verification
- [ ] `npm test` or `npx tsx --test` for logic.
- [ ] Manual UAT checklist.
