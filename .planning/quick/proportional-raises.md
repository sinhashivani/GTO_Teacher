# Plan: Proportional Raise Amounts

Implement raise presets and defaults that are proportional to the pot size and the player's remaining stack.

## Tasks

### 1. Update ActionBar UI
- Add preset buttons for common pot-sized raises (1/3 Pot, 1/2 Pot, Pot, All-In).
- Ensure these buttons respect `minRaise` and `maxRaise`.
- Adjust the layout to accommodate these new buttons.

### 2. Refine Raise Calculation Logic
- Update `ActionBar.tsx` to handle preset calculations.
- A "Pot" raise in poker usually means: `Call Amount + Total Pot (including call)`.
- However, often users just mean `Pot` as in the current display pot. I will implement standard "Pot" raise logic: `Raise to (3 * currentMaxBet + currentPot)`.
- All-In will simply be `maxRaise`.

### 3. Default Raise Amount
- Update the default `betAmount` in `ActionBar.tsx` to be a sensible proportional amount (e.g., 1/2 Pot or 2/3 Pot) if that amount is >= `minRaise`.

## Verification
- Manual check: Preset buttons appear and calculate correct values.
- Manual check: Values never exceed `maxRaise` or fall below `minRaise`.
- Manual check: All-In button correctly sets max amount.
