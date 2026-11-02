'use client';

import React from 'react';
import Link from 'next/link';
import { Play, Users, Trophy, Sparkles, Clock, Lock } from 'lucide-react';
import { soundManager } from '@/lib/sound-effects';

interface GameCardProps {
  id: string;
  title: string;
  vietnameseTitle: string;
  description: string;
  tag: string;
  tagColor: 'green' | 'amber' | 'blue' | 'gray';
  status: 'ACTIVE' | 'BETA' | 'COMING_SOON';
  soloHref?: string;
  pvpHref?: string;
  iconText: string;
  accentBg: string;
}

export const GameCard: React.FC<GameCardProps> = ({
  title,
  vietnameseTitle,
  description,
  tag,
  tagColor,
  status,
  soloHref,
  pvpHref,
  iconText,
  accentBg,
}) => {
  const isAvailable = status === 'ACTIVE';

  const badgeColors = {
    green: 'bg-emerald-100 text-emerald-800 border-emerald-600',
    amber: 'bg-amber-100 text-amber-800 border-amber-600',
    blue: 'bg-blue-100 text-blue-800 border-blue-600',
    gray: 'bg-zinc-200 text-zinc-700 border-zinc-500',
  };

  return (
    <div className="relative rounded-2xl border-4 border-ink bg-paper p-5 md:p-6 shadow-retro transition-all hover:-translate-y-1 hover:shadow-retro-lg flex flex-col justify-between">
      {/* Top Tag & Icon */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div
            className={`w-14 h-14 rounded-2xl border-3 border-ink flex items-center justify-center font-black text-2xl shadow-retro-sm text-paper ${accentBg}`}
          >
            {iconText}
          </div>
          <span
            className={`text-xs font-black px-2.5 py-1 rounded-lg border-2 uppercase tracking-wider ${badgeColors[tagColor]}`}
          >
            {tag}
          </span>
        </div>

        <h3 className="text-xl md:text-2xl font-black text-ink tracking-tight">
          {vietnameseTitle}
        </h3>
        <p className="text-xs text-ink-muted font-bold mb-2 uppercase tracking-wider">
          {title}
        </p>
        <p className="text-sm text-ink/80 leading-relaxed mb-4">
          {description}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 border-t-2 border-paper-border flex flex-col gap-2">
        {isAvailable ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {soloHref && (
              <Link
                href={soloHref}
                onClick={() => soundManager.playClick()}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border-2 border-ink bg-retro-amber hover:bg-retro-amber/90 text-ink font-black text-xs transition shadow-retro-sm btn-retro"
              >
                <Clock className="w-4 h-4" />
                <span>Chơi Đơn (Solo)</span>
              </Link>
            )}
            {pvpHref && (
              <Link
                href={pvpHref}
                onClick={() => soundManager.playClick()}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border-2 border-ink bg-retro-blue hover:bg-retro-blue/90 text-paper font-black text-xs transition shadow-retro-sm btn-retro"
              >
                <Users className="w-4 h-4" />
                <span>Đối Kháng (PvP)</span>
              </Link>
            )}
          </div>
        ) : (
          <button
            disabled
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-ink-muted bg-paper-panel text-ink-muted font-bold text-xs cursor-not-allowed opacity-80"
          >
            <Lock className="w-4 h-4" />
            <span>Đang phát triển (Coming Soon)</span>
          </button>
        )}
      </div>
    </div>
  );
};
