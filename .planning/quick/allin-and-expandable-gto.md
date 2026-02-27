# QUICK PLAN: All-in Logic & Expandable GTO Feedback

## 1. Betting Engine (src/lib/poker/betting.ts)
- [ ] Update `RAISE` case: If `raiseRequired > availableToRaise`, cap the raise to the available stack/credit.
- [ ] Ensure `nextState.lastRaiseAmount` reflects the actual increase in the bet.
- [ ] Verify `CALL` case correctly handles partial calls (all-ins) without throwing.

## 2. GTO UI (src/components/poker/AdviceCard.tsx)
- [ ] Add `isExpanded` state.
- [ ] Implement toggle on click.
- [ ] Show detailed explanation when expanded.
- [ ] Pause auto-dismiss timer when expanded.
- [ ] Improve visual separation between "Click to expand" and "Dismiss".

## 3. Verification
- [ ] Run `npx tsx --test src/lib/poker/__tests__/credit.test.ts` to ensure no regressions.
- [ ] Add a new test case for "All-in Raise" in a new test file or `credit.test.ts`.
