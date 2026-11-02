'use client';

import React, { useRef, useState } from 'react';
import { Download, Share2, Check, Sparkles, Award } from 'lucide-react';
import { AvatarDisplay } from '@/components/avatar/avatar-display';
import { AvatarDto } from '@repo/shared-types';
import { soundManager } from '@/lib/sound-effects';

interface AchievementCardProps {
  nickname: string;
  avatar?: AvatarDto;
  recordTimeMs?: number | null;
  level: number;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({
  nickname,
  avatar,
  recordTimeMs,
  level,
}) => {
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const formatTime = (ms?: number | null) => {
    if (!ms) return '--:--';
    const sec = Math.floor(ms / 1000);
    const millis = Math.floor((ms % 1000) / 10);
    return `${sec}.${millis.toString().padStart(2, '0')}s`;
  };

  const handleDownload = () => {
    soundManager.playClick();
    if (!cardRef.current) return;

    // Use native Canvas to draw high-res achievement card
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background Paper
    ctx.fillStyle = '#FAF7F2';
    ctx.fillRect(0, 0, 600, 400);

    // Border
    ctx.strokeStyle = '#18181B';
    ctx.lineWidth = 8;
    ctx.strokeRect(16, 16, 568, 368);

    // Header stamp
    ctx.fillStyle = '#2A5C9A';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('HỒI ỨC HỌC TRÒ • KỶ LỤC GIA', 300, 70);

    ctx.fillStyle = '#71717A';
    ctx.font = '14px sans-serif';
    ctx.fillText('Nostalgic Mini Game Platform • Verified Achievement', 300, 100);

    // Horizontal line
    ctx.beginPath();
    ctx.moveTo(40, 120);
    ctx.lineTo(560, 120);
    ctx.strokeStyle = '#D8D0C5';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Player Nickname
    ctx.fillStyle = '#18181B';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText(nickname, 300, 190);

    ctx.fillStyle = '#F59E0B';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(`Học Sinh Cấp Độ ${level}`, 300, 220);

    // Game & Record
    ctx.fillStyle = '#18181B';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('KỶ LỤC TÌM SỐ 1–25:', 300, 280);

    ctx.fillStyle = '#2A5C9A';
    ctx.font = 'bold 44px monospace';
    ctx.fillText(formatTime(recordTimeMs), 300, 335);

    // Export to PNG blob
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `KyLuc_${nickname}_NostalgicGame.png`;
    a.click();
  };

  return (
    <div className="rounded-3xl border-4 border-ink bg-paper p-6 shadow-retro max-w-md mx-auto text-center space-y-4">
      <div
        ref={cardRef}
        className="rounded-2xl border-3 border-ink bg-paper-panel p-6 shadow-retro-sm relative overflow-hidden"
      >
        <div className="flex items-center justify-center gap-1.5 text-xs font-black uppercase text-retro-blue tracking-widest mb-1">
          <Award className="w-4 h-4" />
          <span>CHỨNG NHẬN KỶ LỤC</span>
        </div>

        <h3 className="text-xl font-black text-ink tracking-tight mb-4">
          Hồi Ức Học Trò
        </h3>

        <div className="flex flex-col items-center my-3">
          <AvatarDisplay
            color={avatar?.color}
            hat={avatar?.hat}
            glasses={avatar?.glasses}
            size="lg"
          />
          <span className="text-lg font-black text-ink mt-2">{nickname}</span>
          <span className="text-xs font-bold text-retro-amber">
            Cấp Độ {level}
          </span>
        </div>

        <div className="mt-4 p-3 rounded-xl border-2 border-ink bg-paper shadow-retro-sm">
          <div className="text-[10px] text-ink-muted font-black uppercase tracking-wider">
            Kỷ Lục Tìm Số 1–25 (Solo)
          </div>
          <div className="text-3xl font-black font-mono text-retro-blue mt-0.5">
            {formatTime(recordTimeMs)}
          </div>
        </div>
      </div>

      <button
        onClick={handleDownload}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border-3 border-ink bg-retro-blue text-paper font-black text-sm hover:bg-retro-blue/90 transition shadow-retro btn-retro"
      >
        <Download className="w-4 h-4" />
        <span>Tải Ảnh Thẻ Kỷ Lục (PNG)</span>
      </button>
    </div>
  );
};
