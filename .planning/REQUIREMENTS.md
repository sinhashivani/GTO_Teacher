# REQUIREMENTS: GTO Teacher

## 1. Functional Requirements

### 1.1 Gameplay (Heads-up NLHE)
- Support for Preflop and Flop stages (v1).
- Interactive card dealing, betting (Fold, Call, Check, Bet/Raise).
- Bot opponent with 3 difficulty levels:
  - **Easy**: Simple, human-like baseline with common leaks (over-calling, under-bluffing). No cheating.
  - **Medium**: Solid fundamentals with fewer mistakes.
  - **Expert**: Strong baseline lookup for supported spots. Still no cheating.
- Poker showdown and hand evaluation; Source of truth: [Hold’em Hand Evaluation Spec](research/holdem-hand-eval.md); Engine must return per-player best5, handClass, handValue, and description; UI must support a side toggle that displays hand templates and the player’s evaluated best hand at showdown

### 1.2 Coaching & Feedback
- **Feedback Toggle**:
  - Timing: Immediate (after every action) vs. Delayed (after hand complete).
  - Recommendation UI: Show "Best Action" vs "User Action" with rationale.
- **Hand History Visibility**:
  - Toggle: Show during hand (handicap) vs. show only after hand ends.
- **Opponent Insights**: Toggleable display of estimated opponent ranges and likely hand categories.

### 1.3 Hand Helpers
- Real-time display of current hand strength (e.g., "Pair of Aces").
- Display of "Outs" and equity estimates (approximate/Monte Carlo with capped iterations for speed).

### 1.4 Statistics & History
- Tracking of session stats:
  - Win Rate (BB/100 or simple win/loss).
  - Decision Accuracy: % of actions matching the "Expert" recommendation.
  - Common Leaks: Identify patterns (e.g., "Over-folding to 3-bets").
- Hand History: Scrollable log of past hands in the current session.

## 2. Technical Requirements

### 2.1 Storage
- Local-first implementation using Dexie.js for IndexedDB.
- Persistence of user settings and session history.

### 2.2 UI/UX
- Responsive web design (optimized for desktop/tablet tavern view).
- Pixel-art aesthetic using Tailwind CSS and shadcn/ui.
- Subtle animations for cards and chips.

### 2.3 Performance
- Hand evaluation and bot decision logic must run client-side without noticeable lag (<100ms for bot actions).

## 3. Deployment
- Continuous deployment via Vercel.
- Static Site Generation (SSG) or Client-Side Rendering (CSR) for the game engine.
