import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { CoachingFeedback } from "@/lib/useCoaching";
import { X, ChevronDown, ChevronUp, GraduationCap } from "lucide-react";

interface AdviceCardProps {
  feedback: CoachingFeedback;
  onClose: () => void;
  autoDismiss?: number;
}

const typeConfig = {
  good: {
    headerBg: "bg-green-800",
    headerText: "text-green-200",
    label: "Great Move!",
    accentBorder: "border-l-green-500",
  },
  bad: {
    headerBg: "bg-red-900",
    headerText: "text-red-200",
    label: "Deviation",
    accentBorder: "border-l-red-500",
  },
  info: {
    headerBg: "bg-tavern-wood",
    headerText: "text-tavern-gold",
    label: "Insight",
    accentBorder: "border-l-tavern-gold",
  },
};

export const AdviceCard: React.FC<AdviceCardProps> = ({
  feedback,
  onClose,
  autoDismiss = 8000,
}) => {
  const { type, why, whatChanges, recommended, alternatives, confidence } = feedback;
  const config = typeConfig[type];
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Only auto-dismiss if not expanded
    if (autoDismiss > 0 && !isExpanded) {
      const timer = setTimeout(onClose, autoDismiss);
      return () => clearTimeout(timer);
    }
  }, [autoDismiss, onClose, isExpanded]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 60, opacity: 0 }}
        animate={{ 
          x: 0, 
          opacity: 1,
          width: isExpanded ? 340 : 280
        }}
        exit={{ x: 60, opacity: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="fixed top-16 right-4 z-50 shadow-2xl"
      >
        <div
          className={cn(
            "rpg-frame border-l-4 transition-all duration-300",
            config.accentBorder,
            isExpanded ? "scale-105 origin-top-right" : ""
          )}
        >
          {/* Header */}
          <div className={cn("px-3 py-1.5 flex justify-between items-center relative", config.headerBg)}>
            <div className="flex items-center gap-2">
              <GraduationCap className="w-3 h-3 text-current opacity-70" />
              <span className={cn("text-[8px] uppercase tracking-widest font-bold", config.headerText)}>
                {config.label}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {feedback.type === 'bad' && !isExpanded && (
                <span className="text-[7px] text-white bg-black/20 px-1 rounded">
                  GTO: {recommended}
                </span>
              )}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="hover:bg-black/20 rounded p-0.5 transition-colors"
              >
                <X className="w-3 h-3 text-white/70" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div 
            className="px-3 py-2 bg-tavern-parchment flex flex-col gap-2 cursor-pointer hover:bg-tavern-parchment/95 transition-colors"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="flex justify-between items-start gap-2">
              <p className={cn(
                "text-tavern-dark leading-relaxed",
                isExpanded ? "text-[10px] font-bold" : "text-[9px] font-bold"
              )}>
                {why}
              </p>
              {isExpanded ? <ChevronUp className="w-3 h-3 shrink-0 mt-1 opacity-40" /> : <ChevronDown className="w-3 h-3 shrink-0 mt-1 opacity-40" />}
            </div>

            {isExpanded && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                className="flex flex-col gap-3 overflow-hidden"
              >
                <div className="h-px bg-tavern-wood/20" />
                
                {/* Detailed Analysis Section */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[7px] uppercase font-bold text-tavern-wood/60">GTO Analysis</span>
                    <span className="text-[6px] px-1 bg-tavern-wood/10 rounded text-tavern-wood/40 uppercase">Confidence: {confidence}</span>
                  </div>
                  
                  <div className="bg-black/5 p-2 border border-tavern-wood/10 rounded-sm">
                    <p className="text-[9px] text-tavern-dark/90 leading-relaxed">
                      In this spot on the <span className="font-bold">{feedback.context.street}</span>, an expert-level GTO strategy prioritizes <span className="font-bold text-tavern-green">{recommended}</span>.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[7px] uppercase font-bold text-tavern-wood/60">Strategic Nuance</span>
                    <p className="text-[9px] text-tavern-dark/80 italic leading-snug">
                      {whatChanges}
                    </p>
                  </div>
                </div>

                {/* Alternatives */}
                {alternatives.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[7px] uppercase font-bold text-tavern-wood/60">Alternative Lines</span>
                    <div className="grid gap-1.5">
                      {alternatives.map((alt, i) => (
                        <div key={i} className="text-[8px] text-tavern-dark/70 border-l-2 border-tavern-wood/20 pl-2">
                          <span className="font-bold text-tavern-dark uppercase tracking-tighter">{alt.type}:</span> {alt.reason}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-tavern-wood/10 p-2 rounded text-center">
                  <p className="text-[7px] text-tavern-wood/60 uppercase tracking-tighter font-bold">
                    Learning Mode: {feedback.context.callAmount > 0 ? `Facing ${feedback.context.callAmount} bet` : 'Standard Pot'}
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Bottom hint */}
          <div 
            className="px-3 py-1 bg-tavern-parchment/80 border-t border-tavern-wood/20 flex justify-between items-center cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <span className="text-[6px] text-tavern-wood/50 uppercase tracking-wider font-bold">
              {isExpanded ? "Click to collapse" : "Click to expand details"}
            </span>
            {!isExpanded && (
              <span className="text-[6px] text-tavern-wood/30 italic">
                Dismisses in few seconds
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
