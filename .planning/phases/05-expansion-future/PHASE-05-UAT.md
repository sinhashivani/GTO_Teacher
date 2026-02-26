# UAT Checklist: Phase 5 - Expansion

## 1. Multiplayer Setup
- [ ] Select 2, 3, 4, 5, 6 players in Settings.
- [ ] Verify that starting a new hand correctly initializes the selected number of seats.
- [ ] Verify that seats are positioned correctly around the table without overlap.

## 2. Street Progression
- [ ] Play a hand through all streets: Preflop -> Flop -> Turn -> River -> Showdown.
- [ ] Verify that 4th card (Turn) is dealt after Flop action is complete.
- [ ] Verify that 5th card (River) is dealt after Turn action is complete.
- [ ] Verify that Showdown occurs after River action is complete.

## 3. Betting & Side Pots
- [ ] Verify sequential turn order for 3+ players.
- [ ] Verify that folded players are skipped in the turn order.
- [ ] Verify (via Debug Panel) that side pots are calculated when multiple players are all-in.
- [ ] Verify that the winner(s) receive the correct portions of the pot(s).

## 4. Bot Behavior
- [ ] Select Easy, Medium, Expert difficulties and verify distinct playing styles.
- [ ] Select Mixed difficulty and verify that bots at the same table have different skill levels (visible in Debug Panel or names).
- [ ] Verify bots act on all streets (Turn/River).

## 5. Settings & Persistence
- [ ] Toggle coaching settings (Immediate/Delayed) mid-hand and verify no reset.
- [ ] Refresh page and verify that Table Configuration (player count, difficulty) persists.
- [ ] Verify that bankroll persists across hands.

## 6. Leave Game & History
- [ ] Click "Leave Game" mid-hand.
- [ ] Verify confirmation modal appears.
- [ ] Verify that confirming routes back to Lobby.
- [ ] Verify that a "Forfeited" hand is recorded in History with a negative profit.

## 7. Debug Panel
- [ ] Toggle Debug Panel in development mode.
- [ ] Verify it shows correct Stage, Active Player, Pot, and Player state.
- [ ] Verify Hero ID is "p1" and toAct player ID matches.
- [ ] Verify legal actions list updates correctly based on game state.

## 8. Turn Rotation & Stalls (Regression)
- [ ] Verify Bot acts within 2 seconds of Hero's action.
- [ ] Verify Hero auto-checks when all-in (game doesn't stall).
- [ ] Verify round transitions automatically when all remaining players are all-in.
- [ ] Verify sequential bot turns work without skipping players in 3+ player games.
