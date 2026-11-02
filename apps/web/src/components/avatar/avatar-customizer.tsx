'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { AvatarDisplay } from './avatar-display';
import { AvatarColor, AvatarHat, AvatarGlasses } from '@repo/shared-types';
import { soundManager } from '@/lib/sound-effects';
import { Palette, Sparkles, Check } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const AvatarCustomizer: React.FC = () => {
  const { user, isGuest, updateAvatarState } = useAuth();
  if (!user) return null;

  const [color, setColor] = useState<AvatarColor>(user.avatar?.color || 'retro-yellow');
  const [hat, setHat] = useState<AvatarHat>(user.avatar?.hat || 'none');
  const [glasses, setGlasses] = useState<AvatarGlasses>(user.avatar?.glasses || 'none');
  const [isSaving, setIsSaving] = useState(false);

  const colors: { id: AvatarColor; label: string; bg: string }[] = [
    { id: 'retro-yellow', label: 'Vàng Cúc', bg: 'bg-amber-400' },
    { id: 'retro-blue', label: 'Xanh Lam', bg: 'bg-blue-500' },
    { id: 'retro-green', label: 'Xanh Lá', bg: 'bg-emerald-500' },
    { id: 'retro-red', label: 'Đỏ Cờ', bg: 'bg-red-500' },
    { id: 'retro-purple', label: 'Tím Mực', bg: 'bg-purple-500' },
  ];

  const hats: { id: AvatarHat; label: string }[] = [
    { id: 'none', label: 'Không đội mũ' },
    { id: 'student-cap', label: 'Mũ Ca-lô Học Sinh' },
    { id: 'retro-cap', label: 'Mũ Lưỡi Trai Đỏ' },
    { id: 'bunny-ears', label: 'Tai Thỏ Cute' },
    { id: 'wizard', label: 'Nón Phù Thủy' },
  ];

  const glassesList: { id: AvatarGlasses; label: string }[] = [
    { id: 'none', label: 'Không đeo kính' },
    { id: 'classic', label: 'Kính Tròn Thầy Giáo' },
    { id: 'pixel-shades', label: 'Kính Pixel Ngầu' },
    { id: 'nerd', label: 'Kính Vuông Học Bá' },
  ];

  const handleSave = async (
    newColor: AvatarColor = color,
    newHat: AvatarHat = hat,
    newGlasses: AvatarGlasses = glasses
  ) => {
    soundManager.playClick();
    setColor(newColor);
    setHat(newHat);
    setGlasses(newGlasses);

    const updatedAvatar = {
      ...(user.avatar || {
        id: 'temp',
        userId: user.id,
        xpTotal: 0,
        level: 1,
        accessory: 'none',
      }),
      color: newColor,
      hat: newHat,
      glasses: newGlasses,
    };

    updateAvatarState(updatedAvatar);

    if (!isGuest) {
      setIsSaving(true);
      try {
        await fetch(`${API_URL}/api/avatar/me`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            color: newColor,
            hat: newHat,
            glasses: newGlasses,
          }),
          credentials: 'include',
        });
      } catch (err) {
        console.error('Failed to sync avatar with server', err);
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <div className="rounded-2xl border-4 border-ink bg-paper p-5 md:p-6 shadow-retro">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-retro-amber" />
        <h3 className="text-lg font-black tracking-tight">Hồ Sơ Avatar Của Bạn</h3>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Avatar Live Preview */}
        <div className="flex flex-col items-center">
          <AvatarDisplay color={color} hat={hat} glasses={glasses} size="xl" />
          <span className="mt-2 text-xs font-black text-ink">
            {user.nickname}
          </span>
          <span className="text-[11px] font-bold text-retro-blue">
            Cấp độ {user.avatar?.level || 1} • {user.avatar?.xpTotal || 0} XP
          </span>
        </div>

        {/* Customization Options */}
        <div className="flex-1 w-full space-y-4">
          {/* Colors */}
          <div>
            <label className="block text-xs font-bold text-ink mb-1.5">
              Màu Sắc Đại Diện
            </label>
            <div className="flex items-center gap-2">
              {colors.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleSave(c.id, hat, glasses)}
                  className={`w-7 h-7 rounded-full border-2 border-ink ${c.bg} transition-transform ${
                    color === c.id ? 'scale-125 ring-2 ring-ink shadow-retro-sm' : 'hover:scale-110'
                  }`}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {/* Hats */}
          <div>
            <label className="block text-xs font-bold text-ink mb-1.5">
              Phụ Kiện Mũ
            </label>
            <div className="flex flex-wrap gap-1.5">
              {hats.map((h) => (
                <button
                  key={h.id}
                  onClick={() => handleSave(color, h.id, glasses)}
                  className={`text-xs font-bold px-2.5 py-1 rounded-lg border-2 border-ink transition ${
                    hat === h.id
                      ? 'bg-retro-blue text-paper shadow-retro-sm'
                      : 'bg-paper-panel hover:bg-paper-border text-ink'
                  }`}
                >
                  {h.label}
                </button>
              ))}
            </div>
          </div>

          {/* Glasses */}
          <div>
            <label className="block text-xs font-bold text-ink mb-1.5">
              Kính Mắt
            </label>
            <div className="flex flex-wrap gap-1.5">
              {glassesList.map((g) => (
                <button
                  key={g.id}
                  onClick={() => handleSave(color, hat, g.id)}
                  className={`text-xs font-bold px-2.5 py-1 rounded-lg border-2 border-ink transition ${
                    glasses === g.id
                      ? 'bg-retro-blue text-paper shadow-retro-sm'
                      : 'bg-paper-panel hover:bg-paper-border text-ink'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

