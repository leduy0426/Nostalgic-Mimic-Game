'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Volume2, VolumeX, User as UserIcon, LogIn, LogOut, Trophy, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { AvatarDisplay } from '@/components/avatar/avatar-display';
import { soundManager } from '@/lib/sound-effects';

export const Header: React.FC = () => {
  const { user, isGuest, levelProgress, login, register, logout } = useAuth();
  const [isMuted, setIsMuted] = useState(soundManager.getMuted());
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Form state
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);

  const handleToggleSound = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
    if (!muted) soundManager.playClick();
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSubmitting(true);
    soundManager.playClick();

    try {
      if (isRegisterMode) {
        await register(email, nickname, password);
      } else {
        await login(email, password);
      }
      setShowAuthModal(false);
      setEmail('');
      setPassword('');
      setNickname('');
    } catch (err: any) {
      setAuthError(err.message || 'Có lỗi xảy ra');
    } finally {
      setAuthSubmitting(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b-2 border-ink bg-paper/95 backdrop-blur-sm px-4 py-2.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          {/* Logo & Schoolyard Title */}
          <Link
            href="/"
            onClick={() => soundManager.playClick()}
            className="flex items-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-retro-red border-2 border-ink shadow-retro-sm flex items-center justify-center text-paper font-black text-xl tracking-tighter group-hover:rotate-6 transition-transform">
              NH
            </div>
            <div>
              <div className="font-extrabold text-base md:text-lg leading-tight tracking-tight flex items-center gap-1.5">
                <span>HỒI ỨC HỌC TRÒ</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded-md bg-retro-amber border border-ink text-ink">
                  8-Bit Mini
                </span>
              </div>
              <p className="text-xs text-ink-muted hidden sm:block">
                Nostalgic Quick-Play Game Platform
              </p>
            </div>
          </Link>

          {/* Right Section: Level, Sound, Profile */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* XP & Level Progress */}
            {user && (
              <div className="flex items-center gap-2.5 bg-paper-panel px-3 py-1.5 rounded-xl border-2 border-ink shadow-retro-sm">
                <AvatarDisplay
                  color={user.avatar?.color}
                  hat={user.avatar?.hat}
                  glasses={user.avatar?.glasses}
                  size="sm"
                />
                <div className="flex flex-col">
                  <div className="flex items-center justify-between gap-3 text-xs font-bold leading-none">
                    <span className="text-retro-blue font-extrabold">
                      Lv.{levelProgress.currentLevel}
                    </span>
                    <span className="text-ink-muted text-[11px] truncate max-w-[90px] sm:max-w-[120px]">
                      {user.nickname}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-24 sm:w-28 h-2 bg-paper-border rounded-full overflow-hidden mt-1 border border-ink/40">
                    <div
                      className="h-full bg-retro-amber transition-all duration-500"
                      style={{ width: `${levelProgress.progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Sound Toggle */}
            <button
              onClick={handleToggleSound}
              title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
              className="p-2 rounded-xl border-2 border-ink bg-paper-panel hover:bg-paper-border transition shadow-retro-sm btn-retro"
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5 text-ink-muted" />
              ) : (
                <Volume2 className="w-5 h-5 text-retro-blue" />
              )}
            </button>

            {/* Auth Action */}
            {isGuest ? (
              <button
                onClick={() => {
                  soundManager.playClick();
                  setShowAuthModal(true);
                }}
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border-2 border-ink bg-retro-blue text-paper hover:bg-retro-blue/90 transition shadow-retro-sm btn-retro"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Đăng nhập</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  soundManager.playClick();
                  logout();
                }}
                title="Đăng xuất"
                className="p-2 rounded-xl border-2 border-ink bg-paper-panel hover:bg-retro-red/20 text-ink transition shadow-retro-sm btn-retro"
              >
                <LogOut className="w-5 h-5 text-retro-red" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-paper rounded-2xl border-4 border-ink p-6 shadow-retro-lg relative">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-3 right-3 text-ink-muted hover:text-ink font-bold text-lg p-1"
            >
              ✕
            </button>

            <div className="text-center mb-5">
              <h2 className="text-xl font-black tracking-tight">
                {isRegisterMode ? 'Đăng Ký Tài Khoản' : 'Đăng Nhập'}
              </h2>
              <p className="text-xs text-ink-muted mt-1">
                Lưu giữ kỷ lục cá nhân, thăng cấp Avatar và nhận huy hiệu
              </p>
            </div>

            {authError && (
              <div className="mb-4 p-2.5 rounded-lg border-2 border-retro-red bg-retro-red/10 text-retro-red text-xs font-bold">
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold mb-1 text-ink">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hocsinh@truong.edu.vn"
                  className="w-full px-3 py-2 rounded-xl border-2 border-ink bg-paper-panel text-sm focus:outline-none focus:ring-2 focus:ring-retro-blue"
                />
              </div>

              {isRegisterMode && (
                <div>
                  <label className="block text-xs font-bold mb-1 text-ink">Biệt danh hiển thị</label>
                  <input
                    type="text"
                    required
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="Ten_Nguoi_Choi"
                    className="w-full px-3 py-2 rounded-xl border-2 border-ink bg-paper-panel text-sm focus:outline-none focus:ring-2 focus:ring-retro-blue"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold mb-1 text-ink">Mật khẩu</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-xl border-2 border-ink bg-paper-panel text-sm focus:outline-none focus:ring-2 focus:ring-retro-blue"
                />
              </div>

              <button
                type="submit"
                disabled={authSubmitting}
                className="w-full py-2.5 rounded-xl border-2 border-ink bg-retro-blue text-paper font-black text-sm hover:bg-retro-blue/90 transition shadow-retro btn-retro mt-2 disabled:opacity-50"
              >
                {authSubmitting
                  ? 'Đang xử lý...'
                  : isRegisterMode
                  ? 'Tạo Tài Khoản Ngay'
                  : 'Đăng Nhập'}
              </button>
            </form>

            <div className="mt-4 pt-3 border-t-2 border-paper-border text-center text-xs">
              {isRegisterMode ? (
                <span>
                  Đã có tài khoản?{' '}
                  <button
                    onClick={() => {
                      setIsRegisterMode(false);
                      setAuthError('');
                    }}
                    className="text-retro-blue font-bold hover:underline"
                  >
                    Đăng nhập
                  </button>
                </span>
              ) : (
                <span>
                  Chưa có tài khoản?{' '}
                  <button
                    onClick={() => {
                      setIsRegisterMode(true);
                      setAuthError('');
                    }}
                    className="text-retro-blue font-bold hover:underline"
                  >
                    Đăng ký miễn phí
                  </button>
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

