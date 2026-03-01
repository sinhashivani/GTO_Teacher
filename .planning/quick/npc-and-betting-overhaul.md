# Plan: NPC & Betting Overhaul

Implement strict betting limits, interactive slider, and a dynamic NPC pool with individual exit thresholds.

## Tasks

### 1. Betting Consistency & Slider
- Update `src/lib/poker/betting.ts` to ensure `RAISE` amount never exceeds `player.stack + player.currentBet`.
- Update `src/components/poker/ActionBar.tsx` to calculate `maxRaise` strictly based on current stack.
- Update `src/components/poker/BetSlider.tsx` to ensure clicking the track updates the value immediately (standard Radix/Shadcn Slider behavior usually supports this, but I'll verify and ensure `step={1}` and proper event handling).

### 2. NPC Pool & Threshold Logic
- Expand NPC pool in `src/lib/poker/bot.ts` with 30 unique characters (10 per level).
- Add `initialStack` and `exitThreshold` (type: 'broke' | 'target_1k' | 'profit_200') to the bot metadata.
- Implement a helper `shouldBotExit(player: Player, initialStack: number)` in `BotAI`.

### 3. GameController Integration
- Update `sessionPlayers` state to store bot metadata (name, difficulty, initialStack, thresholdType).
- Update the refill logic to pick a random character from the pool that isn't currently at the table.
- Update the settlement effect to use the new `shouldBotExit` logic.

## Verification
- Manual check: Slider clicks move handle.
- Manual check: Cannot raise beyond stack.
- Manual check: Bots leave when hitting thresholds.
