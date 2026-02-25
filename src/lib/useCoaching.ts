import { useState, useCallback } from 'react';
import { GameState, Action, ActionType } from './poker/types';
import { BotAI } from './poker/bot';

export interface Feedback {
  message: string;
  type: 'good' | 'bad' | 'info';
}

export function useCoaching() {
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const evaluateAction = useCallback((state: GameState, playerAction: Action) => {
    // Recommendation is what an 'Expert' bot would do in the player's shoes
    const recommendation = BotAI.getAction(state, 'expert');
    
    let message = "";
    let type: 'good' | 'bad' | 'info' = 'info';

    if (playerAction.type === recommendation.type) {
      message = `Great ${playerAction.type}! This is exactly what a GTO expert would do.`;
      type = 'good';
    } else {
      type = 'bad';
      switch (recommendation.type) {
        case 'FOLD':
          message = `Inaccurate: GTO suggests FOLDING here. Your hand is likely beat.`;
          break;
        case 'CHECK':
          message = `Inaccurate: CHECKING is safer here. Don't build a pot with this hand.`;
          break;
        case 'CALL':
          message = `Inaccurate: CALLING is better to realize your equity.`;
          break;
        case 'RAISE':
          message = `Inaccurate: This is a strong spot to RAISE for value or as a bluff.`;
          break;
      }
    }

    setFeedback({ message, type });
  }, []);

  return { feedback, setFeedback, evaluateAction };
}
