# SUMMARY: 10-02 - Position UI & Secure Card Reveal

Updated UI to show position labels and implemented card reveal logic when Hero folds.

## Completed Tasks
- **Position Labels UI**: 
  - Added `showPositionLabels` to `UserSettings` in `db.ts`.
  - Added toggle in `SettingsDialog.tsx`.
  - Implemented gold position badges in `PlayerSeat.tsx`.
  - Integrated `getPositionLabel` in `GameController.tsx` to pass labels to seats.
- **Secure Card Reveal**:
  - Modified `PokerGame.getPublicState` in `state-machine.ts` to reveal all non-folded bot hole cards if the Hero (`p1`) has folded.

## Verification
- Position badges (BTN, SB, BB, UTG, MP, CO) appear correctly on seats.
- Toggling "Show Position Labels" in settings works as expected.
- Folding Hero immediately reveals the hole cards of remaining bot players.
