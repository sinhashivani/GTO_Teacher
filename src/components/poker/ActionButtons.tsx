import React from "react";
import { Button } from "@/components/ui/button";
import { ActionType } from "@/lib/poker/types";

interface ActionButtonsProps {
  onAction: (type: ActionType, amount?: number) => void;
  canCheck: boolean;
  canCall: boolean;
  canRaise: boolean;
  callAmount: number;
  minRaise: number;
  maxRaise: number;
  disabled?: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onAction,
  canCheck,
  canCall,
  canRaise,
  callAmount,
  minRaise,
  maxRaise,
  disabled,
}) => {
  return (
    <div className="flex gap-4 p-4 bg-black/40 border-t-2 border-tavern-gold w-full justify-center">
      <Button
        variant="destructive"
        className="pixel-border uppercase"
        onClick={() => onAction("FOLD")}
        disabled={disabled}
      >
        Fold
      </Button>
      
      {canCheck && (
        <Button
          className="bg-tavern-gold text-tavern-dark hover:bg-white pixel-border uppercase"
          onClick={() => onAction("CHECK")}
          disabled={disabled}
        >
          Check
        </Button>
      )}
      
      {canCall && (
        <Button
          className="bg-tavern-gold text-tavern-dark hover:bg-white pixel-border uppercase"
          onClick={() => onAction("CALL")}
          disabled={disabled}
        >
          Call {callAmount > 0 && `(${callAmount})`}
        </Button>
      )}
      
      {canRaise && (
        <Button
          className="bg-tavern-gold text-tavern-dark hover:bg-white pixel-border uppercase"
          onClick={() => onAction("RAISE", minRaise)}
          disabled={disabled}
        >
          Raise {minRaise}
        </Button>
      )}
    </div>
  );
};
