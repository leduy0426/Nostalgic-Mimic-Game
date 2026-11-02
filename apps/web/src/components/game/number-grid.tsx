'use client';

import React, { useState } from 'react';
import { soundManager } from '@/lib/sound-effects';

interface NumberGridProps {
  board: number[]; // 25 numbers
  currentTarget: number; // 1..26
  claimedCells?: Record<number, string>; // number -> playerId (for PvP or solo)
  myPlayerId?: string;
  onNumberClick: (number: number) => void;
  disabled?: boolean;
}

export const NumberGrid: React.FC<NumberGridProps> = ({
  board,
  currentTarget,
  claimedCells = {},
  myPlayerId,
  onNumberClick,
  disabled = false,
}) => {
  const [shakingNumber, setShakingNumber] = useState<number | null>(null);

  const handleClick = (num: number) => {
    if (disabled) return;

    if (num === currentTarget) {
      soundManager.playCorrect();
      onNumberClick(num);
    } else {
      soundManager.playWrong();
      setShakingNumber(num);
      setTimeout(() => setShakingNumber(null), 300);
      onNumberClick(num); // still inform parent
    }
  };

  return (
    <div className="w-full max-w-md mx-auto aspect-square grid grid-cols-5 gap-2 md:gap-3 p-3 md:p-4 rounded-3xl border-4 border-ink bg-paper shadow-retro">
      {board.map((num) => {
        const isClaimed = num < currentTarget || claimedCells[num] !== undefined;
        const isShaking = shakingNumber === num;
        const claimedByMe = claimedCells[num] === myPlayerId;
        const claimedByOpponent = isClaimed && claimedCells[num] && !claimedByMe;

        return (
          <button
            key={num}
            type="button"
            disabled={disabled || isClaimed}
            onClick={() => handleClick(num)}
            className={`relative flex items-center justify-center rounded-xl md:rounded-2xl border-2 md:border-3 border-ink font-black text-xl md:text-2xl transition-all select-none touch-manipulation ${
              isShaking ? 'animate-shake bg-retro-red/20 border-retro-red' : ''
            } ${
              isClaimed
                ? claimedByOpponent
                  ? 'bg-retro-red/30 text-ink/40 border-ink/40 line-through opacity-60 scale-95'
                  : 'bg-paper-panel text-ink/30 border-ink/40 line-through opacity-50 scale-95'
                : 'bg-paper hover:bg-paper-panel active:scale-95 shadow-retro-sm text-ink cursor-pointer'
            }`}
          >
            {/* Number text */}
            <span>{num}</span>

            {/* Check stamp for found number */}
            {isClaimed && (
              <span className="absolute text-[10px] md:text-xs font-black font-mono text-ink/40 bottom-0.5 right-1">
                ✓
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
