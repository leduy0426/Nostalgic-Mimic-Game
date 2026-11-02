'use client';

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Share2, Sparkles, Clock, ArrowRight } from 'lucide-react';
import { soundManager } from '@/lib/sound-effects';
import { AvatarDisplay } from '@/components/avatar/avatar-display';
import { AvatarDto } from '@repo/shared-types';

interface ResultModalProps {
  isOpen: boolean;
  completionTimeMs: number;
  isNewPersonalBest: boolean;
  personalBestMs: number;
  xpAwarded: number;
  avatar?: AvatarDto;
  nickname: string;
  onPlayAgain: () => void;
  onBackToHub: () => void;
}

export const ResultModal: React.FC<ResultModalProps> = ({
  isOpen,
  completionTimeMs,
  isNewPersonalBest,
  personalBestMs,
  xpAwarded,
  avatar,
  nickname,
  onPlayAgain,
  onBackToHub,
}) => {
  useEffect(() => {
    if (isOpen) {
      soundManager.playVictory();
      if (isNewPersonalBest) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    }
  }, [isOpen, isNewPersonalBest]);

  if (!isOpen) return null;

  const formatTime = (ms: number) => {
    const sec = Math.floor(ms / 1000);
    const millis = ms % 1000;
    return `${sec}.${millis.toString().padStart(3, '0')}s`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-paper rounded-3xl border-4 border-ink p-6 md:p-8 shadow-retro-lg text-center relative overflow-hidden">
        {/* Top Celebration Badge */}
        {isNewPersonalBest ? (
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border-2 border-ink bg-retro-amber text-ink font-black text-xs uppercase tracking-wider mb-4 shadow-retro-sm animate-bounce">
            <Trophy className="w-4 h-4 fill-current text-ink" />
            <span>KỶ LỤC MỚI CỦA BẠN!</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border-2 border-ink bg-paper-panel text-ink font-black text-xs uppercase tracking-wider mb-4 shadow-retro-sm">
            <Sparkles className="w-4 h-4 text-retro-blue" />
            <span>HOÀN THÀNH VÁN CHƠI</span>
          </div>
        )}

        {/* Big Time Display */}
        <div className="my-2">
          <div className="text-4xl md:text-5xl font-black font-mono tracking-tight text-retro-blue">
            {formatTime(completionTimeMs)}
          </div>
          <p className="text-xs text-ink-muted font-bold mt-1 uppercase tracking-wider">
            Thời Gian Hoàn Thành (1 đến 25)
          </p>
        </div>

        {/* Stats card */}
        <div className="my-5 p-4 rounded-2xl border-2 border-ink bg-paper-panel shadow-retro-sm flex items-center justify-around gap-2">
          {/* Avatar & XP */}
          <div className="flex flex-col items-center">
            <AvatarDisplay
              color={avatar?.color}
              hat={avatar?.hat}
              glasses={avatar?.glasses}
              size="sm"
            />
            <span className="text-[11px] font-extrabold text-retro-green mt-1">
              +{xpAwarded} XP
            </span>
          </div>

          <div className="h-8 w-[2px] bg-paper-border" />

          {/* Personal Best */}
          <div className="text-left">
            <div className="text-[10px] text-ink-muted font-bold uppercase tracking-wider">
              Kỷ Lục Cá Nhân
            </div>
            <div className="text-lg font-black font-mono text-ink">
              {formatTime(personalBestMs)}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => {
              soundManager.playClick();
              onPlayAgain();
            }}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl border-3 border-ink bg-retro-amber hover:bg-retro-amber/90 text-ink font-black text-base transition shadow-retro btn-retro"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Chơi Lại Ngay (Play Again)</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onBackToHub();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl border-2 border-ink bg-paper-panel hover:bg-paper-border text-ink font-bold text-xs transition shadow-retro-sm btn-retro"
          >
            <span>Về Trang Chủ (Menu)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

