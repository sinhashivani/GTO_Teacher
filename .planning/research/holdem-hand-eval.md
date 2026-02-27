# Hold’em Hand Evaluation Spec

Inputs and outputs; Inputs: player hole cards (2) + community cards (0–5, 5 at showdown), all as rank 2–14 (11=J, 12=Q, 13=K, 14=A) and suit in {S,H,D,C}; Output per player at showdown: handClass, handClassRank, best5 (5 cards), tiebreak (list of ranks used for comparison), handValue (comparable tuple), description string; Output for round: winner playerId(s), tie flag, pot split amounts if applicable

Hand ranking order (high to low); Straight Flush (includes Royal Flush); Four of a Kind; Full House; Flush; Straight; Three of a Kind; Two Pair; One Pair; High Card

Comparison rule; Compare hands by handValue tuple lexicographically; handValue = (handClassRank, tiebreak1, tiebreak2, ...); Higher tuple wins; If handValue equal, tie and split pot

Card features from 7 cards; Build countsByRank: map rank -> count; Derive quads (count 4), trips (count 3), pairs (count 2), singles (count 1), each sorted by rank desc; Build cardsBySuit: map suit -> list of cards in that suit sorted by rank desc; Build uniqueRanks sorted desc; Straight helper must support Ace-low: if Ace (14) present, treat it as also rank 1 for straight detection; Define bestStraightHigh(ranks) returning highest straight high card, with wheel A-2-3-4-5 returning high=5

Evaluation algorithm (always return first match from strongest to weakest); Step 1: From 7 cards compute features above; Step 2: Try to find Straight Flush, else Four, else Full House, else Flush, else Straight, else Trips, else Two Pair, else Pair, else High Card; Step 3: Return best5 and handValue per templates below

Templates and tie-break rules; Straight Flush: template X X X X X same suit consecutive; tiebreak (highStraight); best5 are the five cards in that suit that form the straight; Four of a Kind: template A A A A + kicker; tiebreak (quadRank, kickerRank); best5 are four quadRank cards + highest remaining; Full House: template A A A + B B; tiebreak (tripRank, pairRank); best5 are highest trip + highest remaining pair (pairs or second trip); Flush: template 5 cards same suit; tiebreak (c1,c2,c3,c4,c5) ranks desc; best5 are top 5 ranks in best suit (choose suit with best lexicographic top5); Straight: template 5 consecutive ranks any suits; tiebreak (highStraight); best5 are any cards matching the ranks (suit irrelevant); Three of a Kind: template A A A + k1 + k2; tiebreak (tripRank, k1, k2); best5 are trip + top 2 kickers; Two Pair: template A A + B B + kicker; tiebreak (highPair, lowPair, kicker); best5 are best two pairs (highest then next) + best remaining kicker; One Pair: template A A + k1 + k2 + k3; tiebreak (pairRank, k1, k2, k3); best5 are pair + top 3 kickers; High Card: template k1 k2 k3 k4 k5; tiebreak (k1,k2,k3,k4,k5); best5 are top 5 ranks overall

Straight detection details; A straight exists when 5 distinct ranks are consecutive; Ace-low straight uses A as 1 and has highStraight=5; For Straight Flush, straight must be found within a single suit bucket; If both flush and straight exist but not aligned in suit, it is not a straight flush

Pot resolution; If all but one player folded, remaining player wins immediately with no showdown; At showdown evaluate each active player, compute max handValue; Single max wins; Multiple max ties split pot equally; Remainder chip rule: if pot not divisible by number of winners, award remainder to earliest seat left of dealer, or define another deterministic seat-order rule

Hand templates toggle content (UI); Straight Flush: [R][R-1][R-2][R-3][R-4] same suit (includes A K Q J 10 and 5 4 3 2 A); Four of a Kind: A A A A + X; Full House: A A A + B B; Flush: any 5 same suit; Straight: any 5 consecutive ranks (includes A K Q J 10 and 5 4 3 2 A); Three of a Kind: A A A + X + Y; Two Pair: A A + B B + X; One Pair: A A + X + Y + Z; High Card: A K Q J 9 (no pair, no straight, no flush)

Showdown description strings (UI); Straight Flush: "Straight Flush to [high]"; Four of a Kind: "Four of a kind, [rank]s with [kicker]"; Full House: "Full house, [trip]s full of [pair]s"; Flush: "Flush, [ranks high-to-low]"; Straight: "Straight to [high]"; Three of a Kind: "Three of a kind, [trip]s with [kickers]"; Two Pair: "Two pair, [highPair]s and [lowPair]s with [kicker]"; One Pair: "Pair of [pair]s with [kickers]"; High Card: "High card [top], then [next...]"

Edge cases; Board-only hands allowed and can cause ties; Three pairs in 7 cards uses top two pairs and best kicker; Two trips in 7 cards forms full house using highest trip as trips and second trip as pair; Always choose highest category then apply tie-break; Negative indexing must never occur in DP style logic, always guard i >= c in transitions

Test vectors (recommended); Add at least: straight flush vs four, full house from two trips, three pairs choosing best two, wheel straight A-2-3-4-5, board-only tie, two pair kicker comparison, flush high-card comparison across suits, sample hand: board 8S 4S 8C 3S JS, P1 Jd 6d beats P2 3h 5c

/gsd:plan-phase

Goal; Implement Texas Hold’em showdown winner evaluation and bankroll updates, and expose winning hand templates for a side toggle UI

Scope; Engine-side hand evaluation; Determine winner(s) at showdown for N players; Pot settlement into player bankrolls; Persist bankrolls (localStorage by default, optional SQLite later); UI toggle that displays hand ranking templates and the evaluated best hand (handClass, best5, description)

Rules spec to implement; Use standard Texas Hold’em ranking and tie-break logic; Evaluate best 5-card hand from 7 cards (2 hole + 5 board); Rank order: Straight Flush; Four of a Kind; Full House; Flush; Straight; Three of a Kind; Two Pair; One Pair; High Card; Compare hands by tuple handValue = (classRank, tiebreak fields) lexicographically; Handle Ace-low straight (A-2-3-4-5 high=5); If multiple winners share identical handValue, tie and split pot

Evaluator requirements; Provide function evaluate7(cards7) -> { handClass, classRank, best5, tiebreak, handValue, description }; Provide function determineWinners(players, board) -> { winners[], evaluationsByPlayerId }; Ensure best5 is the actual chosen 5 cards; Ensure description matches hand type including kickers; Add test vectors covering: ace-low straight; straight flush; full house from two trips; three pairs chooses top two; board-only tie; two pair kicker comparison; sample: board 8S 4S 8C 3S JS, P1 Jd 6d beats P2 3h 5c

Pot + bankroll requirements; Track bankroll per playerId; Bets should deduct from bankroll at bet time and add to pot; On hand end: if everyone but one folded, that player wins full pot; else at showdown call determineWinners and settle pot; Split pot evenly among winners; Remainder chips distributed deterministically by seat order (earliest seat left of dealer or first in seatOrder array); Update bankrolls accordingly; Reset pot to 0 for next hand; Provide function settlePot(bankrolls, {winners, pot, seatOrder}) -> updatedBankrolls

# Bankroll Update
Persistence requirements; Default persistence via browser localStorage key "gto_teacher.bankrolls.v1" (or per-game key if games are separate); Implement loadBankrolls() and saveBankrolls(); Wire settlement to save updated bankrolls; Ensure UI reads bankrolls reactively after settlement; Optional future: SQLite/Prisma API routes but do not block current milestone

UI requirements; Add side toggle panel "Hand Guide"; Show templates: Straight Flush: [R][R-1][R-2][R-3][R-4] same suit; Four: A A A A + X; Full House: A A A + B B; Flush: any 5 same suit; Straight: any 5 consecutive ranks; Trips: A A A + X + Y; Two Pair: A A + B B + X; Pair: A A + X + Y + Z; High Card: A K Q J 9; At showdown show each player’s evaluated hand: handClass + best5 + description; Ensure this panel does not affect game state

Deliverables; Implement evaluator module with tests; Implement bankroll store + settlement logic with tests; Integrate settlement into game loop; Add Hand Guide UI toggle; Document usage in REQUIREMENTS.md and link to research/holdem-hand-eval.md as source of truth