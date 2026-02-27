import { useState, useCallback } from 'react';
import { GameState, Action, ActionType } from './poker/types';
import { BotAI } from './poker/bot';

export interface CoachingFeedback {
  context: {
    street: string;
    pot: number;
    stack: number;
    callAmount: number;
  };
  actionTaken: ActionType;
  recommended: ActionType;
  why: string;
  whatChanges: string;
  confidence: 'baseline' | 'heuristic' | 'lookup';
  alternatives: { type: ActionType; reason: string }[];
  type: 'good' | 'bad' | 'info';
}

export function useCoaching() {
  const [feedback, setFeedback] = useState<CoachingFeedback | null>(null);

  const evaluateAction = useCallback((state: GameState, playerAction: Action) => {
    const hero = state.players.find(p => p.id === 'p1')!;
    const currentMaxBet = Math.max(...state.players.map(p => p.currentBet));
    const callAmount = currentMaxBet - hero.currentBet;

    // Recommendation is what an 'Expert' bot would do in the player's shoes
    const recommendation = BotAI.getAction(state, 'expert');
    
    const isCorrect = playerAction.type === recommendation.type;
    
    // Structured logic
    const feedbackObj: CoachingFeedback = {
      context: {
        street: state.stage,
        pot: state.pot,
        stack: hero.stack,
        callAmount
      },
      actionTaken: playerAction.type,
      recommended: recommendation.type,
      type: isCorrect ? 'good' : 'bad',
      confidence: 'heuristic',
      why: "",
      whatChanges: "",
      alternatives: []
    };

    if (recommendation.type === 'FOLD') {
      feedbackObj.why = "Your hand has very low equity against the opponent's range and the current pot odds do not justify a call.";
      feedbackObj.whatChanges = "If the pot was larger or the bet smaller, you might have the correct pot odds to see another card.";
      feedbackObj.alternatives = [{ type: 'CALL', reason: "Only if you suspect a very high frequency bluff." }];
    } else if (recommendation.type === 'CHECK') {
      feedbackObj.why = "This hand is best played for a small pot. Checking controls the size of the pot and protects your range.";
      feedbackObj.whatChanges = "If the opponent is extremely passive, you could bet for thin value.";
      feedbackObj.alternatives = [{ type: 'RAISE', reason: "As a polar bluff if you have good blockers." }];
    } else if (recommendation.type === 'CALL') {
      feedbackObj.why = "You have enough equity to continue, and your hand is too strong to fold but not strong enough to raise for value.";
      feedbackObj.whatChanges = "If the bet size was much larger, this would become a fold.";
      feedbackObj.alternatives = [
        { type: 'RAISE', reason: "To turn your hand into a bluff if the board texture is scary." },
        { type: 'FOLD', reason: "If the opponent is known to never bluff in this spot." }
      ];
    } else if (recommendation.type === 'RAISE') {
      feedbackObj.why = "You have a significant range advantage or a very strong hand that wants to build a pot immediately.";
      feedbackObj.whatChanges = "On very dry boards, checking to induce bluffs might be viable.";
      feedbackObj.alternatives = [{ type: 'CHECK', reason: "To trap an aggressive opponent." }];
    }

    if (isCorrect) {
      feedbackObj.why = `Correct! ${feedbackObj.why}`;
    } else {
      feedbackObj.why = `Deviation: ${feedbackObj.why}`;
    }

    setFeedback(feedbackObj);
  }, []);

  return { feedback, setFeedback, evaluateAction };
}
