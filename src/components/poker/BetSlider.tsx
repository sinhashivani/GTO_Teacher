import React from "react";
import { Slider } from "@/components/ui/slider";

interface BetSliderProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export const BetSlider: React.FC<BetSliderProps> = ({
  value,
  min,
  max,
  onChange,
  disabled,
}) => {
  return (
    <div className="flex flex-col gap-2 w-full max-w-xs items-center">
      <div className="flex justify-between w-full text-[10px] uppercase">
        <span>Min: {min}</span>
        <span className="text-white font-bold">Bet: {value}</span>
        <span>Max: {max}</span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={1}
        onValueChange={(vals) => onChange(vals[0])}
        disabled={disabled}
        className="cursor-pointer"
      />
    </div>
  );
};
