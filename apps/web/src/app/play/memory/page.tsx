'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, RotateCcw, Trophy, Clock, Sparkles } from 'lucide-react';
import { soundManager } from '@/lib/sound-effects';
import confetti from 'canvas-confetti';

interface MemoryCard {
  id: number;
  pairId: number;
  label: string;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const ITEMS = [
  { pairId: 1, label: 'Bút chì 2B', emoji: '✏️' },
  { pairId: 2, label: 'Cục tẩy', emoji: '🧼' },
  { pairId: 3, label: 'Thước kẻ', emoji: '📐' },
  { pairId: 4, label: 'Tập vở ô ly', emoji: '📓' },
  { pairId: 5, label: 'Hòn bi ve', emoji: '⚪' },
  { pairId: 6, label: 'Cầu lông', emoji: '🏸' },
  { pairId: 7, label: 'Phấn màu', emoji: '🖍️' },
  { pairId: 8, label: 'Compa', emoji: '🧭' },
];

export default function MemoryMatchingPage() {
  const router = useRouter();
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<MemoryCard[]>([]);
  const [moves, setMoves] = useState<number>(0);
  const [isWon, setIsWon] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);

  const initGame = () => {
    soundManager.playClick();
    const pairs: MemoryCard[] = [];
    let idCounter = 1;

    ITEMS.forEach((item) => {
      // 2 cards per item
      pairs.push({
        id: idCounter++,
        pairId: item.pairId,
        label: item.label,
        emoji: item.emoji,
        isFlipped: false,
        isMatched: false,
      });
      pairs.push({
        id: idCounter++,
        pairId: item.pairId,
        label: item.label,
        emoji: item.emoji,
        isFlipped: false,
        isMatched: false,
      });
    });

    // Shuffle
    for (let i = pairs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = pairs[i];
      pairs[i] = pairs[j];
      pairs[j] = temp;
    }

    setCards(pairs);
    setSelectedCards([]);
    setMoves(0);
    setIsWon(false);
    setIsLocked(false);
  };

  useEffect(() => {
    initGame();
  }, []);

  const handleCardClick = (card: MemoryCard) => {
    if (isLocked || card.isFlipped || card.isMatched) return;

    soundManager.playClick();
    const flippedCard = { ...card, isFlipped: true };
    const newCards = cards.map((c) => (c.id === card.id ? flippedCard : c));
    setCards(newCards);

    const newSelected = [...selectedCards, flippedCard];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      setIsLocked(true);
      setMoves((m) => m + 1);

      const [first, second] = newSelected;
      if (first.pairId === second.pairId) {
        // Matched!
        soundManager.playCorrect();
        setTimeout(() => {
          const matchedCards = newCards.map((c) =>
            c.pairId === first.pairId ? { ...c, isMatched: true } : c
          );
          setCards(matchedCards);
          setSelectedCards([]);
          setIsLocked(false);

          if (matchedCards.every((c) => c.isMatched)) {
            setIsWon(true);
            soundManager.playVictory();
            confetti({ particleCount: 80, spread: 70 });
          }
        }, 500);
      } else {
        // Not matched
        soundManager.playWrong();
        setTimeout(() => {
          const resetCards = newCards.map((c) =>
            c.id === first.id || c.id === second.id
              ? { ...c, isFlipped: false }
              : c
          );
          setCards(resetCards);
          setSelectedCards([]);
          setIsLocked(false);
        }, 800);
      }
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-5 animate-fade-in">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            soundManager.playClick();
            router.push('/');
          }}
          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border-2 border-ink bg-paper-panel hover:bg-paper-border transition shadow-retro-sm btn-retro"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về Hub</span>
        </button>

        <button
          onClick={initGame}
          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border-2 border-ink bg-retro-amber text-ink transition shadow-retro-sm btn-retro"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Chơi Lại</span>
        </button>
      </div>

      {/* Stats */}
      <div className="rounded-2xl border-3 border-ink bg-paper p-4 shadow-retro-sm flex items-center justify-between">
        <div>
          <div className="text-[10px] text-ink-muted font-black uppercase tracking-wider">
            Số Lượt Lật
          </div>
          <div className="text-2xl font-black font-mono text-retro-blue">
            {moves} Lượt
          </div>
        </div>

        {isWon && (
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full border-2 border-ink bg-retro-amber text-ink font-black text-xs uppercase animate-bounce">
            <Trophy className="w-4 h-4" />
            <span>Hoàn Thành Xuất Sắc!</span>
          </div>
        )}
      </div>

      {/* 4x4 Memory Grid */}
      <div className="w-full aspect-square max-w-md mx-auto grid grid-cols-4 gap-2.5 md:gap-3 p-3 md:p-4 rounded-3xl border-4 border-ink bg-paper shadow-retro">
        {cards.map((card) => {
          const isOpen = card.isFlipped || card.isMatched;

          return (
            <button
              key={card.id}
              type="button"
              disabled={isLocked || card.isMatched}
              onClick={() => handleCardClick(card)}
              className={`w-full h-full rounded-2xl border-2 md:border-3 border-ink flex flex-col items-center justify-center transition-all transform select-none ${
                isOpen
                  ? card.isMatched
                    ? 'bg-retro-green/20 border-retro-green opacity-70 scale-95'
                    : 'bg-paper-panel scale-100 shadow-retro-sm'
                  : 'bg-retro-blue hover:bg-retro-blue/90 shadow-retro-sm'
              }`}
            >
              {isOpen ? (
                <>
                  <span className="text-2xl md:text-3xl">{card.emoji}</span>
                  <span className="text-[10px] font-bold text-ink mt-1 truncate max-w-[60px]">
                    {card.label}
                  </span>
                </>
              ) : (
                <span className="text-xl md:text-2xl text-paper font-black">
                  ?
                </span>
              )}
            </button>
          );
        })}
      </div>

      <p className="text-center text-xs text-ink-muted font-medium">
        Lật mở và tìm 8 cặp đồ dùng học tập quen thuộc giống nhau ít lượt nhất có thể!
      </p>
    </div>
  );
}

