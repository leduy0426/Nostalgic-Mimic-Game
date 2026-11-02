'use client';

import React from 'react';
import Link from 'next/link';
import { GameCard } from '@/components/hub/game-card';
import { AvatarCustomizer } from '@/components/avatar/avatar-customizer';
import { Zap, Trophy, Play, Users, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { soundManager } from '@/lib/sound-effects';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border-4 border-ink bg-paper-panel p-6 md:p-8 shadow-retro">
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border-2 border-ink bg-retro-amber text-xs font-black uppercase tracking-wider mb-3 shadow-retro-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Nostalgic Quick-Play Hub</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-ink tracking-tight leading-tight">
            Những Trò Chơi Học Đường Gợi Nhớ Tuổi Thơ
          </h1>
          <p className="mt-3 text-sm md:text-base text-ink/80 leading-relaxed font-medium">
            Không cần cài đặt ứng dụng. Nhấn để chơi ngay trong 30 giây, tranh tài cùng bạn bè trong phòng đấu thời gian thực, tích lũy điểm kinh nghiệm và cá nhân hóa Avatar của riêng bạn!
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/play/number-hunt/solo"
              onClick={() => soundManager.playClick()}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl border-3 border-ink bg-retro-blue text-paper font-black text-sm hover:bg-retro-blue/90 transition shadow-retro btn-retro"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Chơi Ngay: Tìm Số 1–25</span>
            </Link>

            <Link
              href="/play/number-hunt/pvp"
              onClick={() => soundManager.playClick()}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl border-3 border-ink bg-paper text-ink font-black text-sm hover:bg-paper-border transition shadow-retro btn-retro"
            >
              <Users className="w-4 h-4 text-retro-blue" />
              <span>Tạo Phòng Đấu PvP</span>
            </Link>
          </div>
        </div>

        {/* Decorative Grid Stamp in Background */}
        <div className="absolute right-4 -bottom-6 opacity-20 pointer-events-none select-none text-9xl font-black font-mono">
          25
        </div>
      </div>

      {/* Mini Game Catalog */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-ink">
              Kho Trò Chơi Học Đường
            </h2>
            <p className="text-xs text-ink-muted font-medium">
              Các tựa game cổ điển trên trang giấy kẻ ô thời học sinh
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* 1. Number Hunt */}
          <GameCard
            id="number-hunt"
            vietnameseTitle="Tìm Số 1 Đến 25"
            title="Number Hunt"
            description="Tìm và bấm lần lượt các số từ 1 đến 25 nhanh nhất có thể. Đấu đơn tính thời gian hoặc so tài tốc độ trực tiếp với bạn bè!"
            tag="Đang Hoạt Động"
            tagColor="green"
            status="ACTIVE"
            soloHref="/play/number-hunt/solo"
            pvpHref="/play/number-hunt/pvp"
            iconText="1-25"
            accentBg="bg-retro-blue"
          />

          {/* 2. Caro */}
          <GameCard
            id="caro"
            vietnameseTitle="Cờ Caro 5 Hàng"
            title="Caro 5-in-a-Row"
            description="Trò chơi đối kháng chiến thuật kinh điển từng ô tập kẻ vở. Nối 5 quân cờ liên tiếp theo hàng ngang, dọc hoặc chéo để chiến thắng."
            tag="Giai Đoạn Mở Rộng"
            tagColor="amber"
            status="BETA"
            pvpHref="/play/caro"
            iconText="X O"
            accentBg="bg-retro-red"
          />

          {/* 3. Memory Matching */}
          <GameCard
            id="memory-matching"
            vietnameseTitle="Lật Hình Trí Nhớ"
            title="Memory Matching"
            description="Lật mở các cặp đồ dùng học tập quen thuộc (cục tẩy, bút chì, compa, thước kẻ). Thử thách trí nhớ và tốc độ ghi nhớ của bạn!"
            tag="Sắp Ra Mắt"
            tagColor="gray"
            status="COMING_SOON"
            soloHref="/play/memory"
            iconText="🃏"
            accentBg="bg-retro-green"
          />
        </div>
      </div>

      {/* Avatar Customization Widget */}
      <AvatarCustomizer />
    </div>
  );
}
