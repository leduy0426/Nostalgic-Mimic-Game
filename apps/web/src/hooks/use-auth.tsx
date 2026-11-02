'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfileDto, AvatarDto, getLevelProgress, LevelProgressDto } from '@repo/shared-types';

interface AuthContextType {
  user: UserProfileDto | null;
  isLoading: boolean;
  isGuest: boolean;
  levelProgress: LevelProgressDto;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, nickname: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  updateAvatarState: (avatar: AvatarDto) => void;
  updatePersonalBest: (pbMs: number) => void;
}

const defaultAvatar: AvatarDto = {
  id: 'guest_avatar',
  userId: 'guest',
  color: 'retro-yellow',
  hat: 'none',
  glasses: 'none',
  accessory: 'none',
  xpTotal: 0,
  level: 1,
};

const AuthContext = createContext<AuthContextType | null>(null);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfileDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check session on mount
    fetch(`${API_URL}/api/auth/me`, { credentials: 'include' })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Not logged in');
      })
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {
        // Fallback to local guest profile
        const savedGuest = localStorage.getItem('nostalgic_guest_user');
        if (savedGuest) {
          try {
            setUser(JSON.parse(savedGuest));
          } catch {
            createGuest();
          }
        } else {
          createGuest();
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const createGuest = () => {
    const guestUser: UserProfileDto = {
      id: 'guest_' + Math.random().toString(36).substring(2, 8),
      email: 'guest@local',
      nickname: 'Bạn_Nhỏ_' + Math.floor(1000 + Math.random() * 9000),
      role: 'PLAYER',
      createdAt: new Date().toISOString(),
      avatar: defaultAvatar,
      personalBestSoloMs: null,
    };
    setUser(guestUser);
    localStorage.setItem('nostalgic_guest_user', JSON.stringify(guestUser));
  };

  const login = async (email: string, pass: string) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass }),
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Đăng nhập thất bại');
    setUser(data.user);
    localStorage.removeItem('nostalgic_guest_user');
  };

  const register = async (email: string, nickname: string, pass: string) => {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, nickname, password: pass }),
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Đăng ký thất bại');
    setUser(data.user);
    localStorage.removeItem('nostalgic_guest_user');
  };

  const logout = async () => {
    await fetch(`${API_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    createGuest();
  };

  const updateAvatarState = (newAvatar: AvatarDto) => {
    if (!user) return;
    const updated = { ...user, avatar: newAvatar };
    setUser(updated);
    if (user.id.startsWith('guest_')) {
      localStorage.setItem('nostalgic_guest_user', JSON.stringify(updated));
    }
  };

  const updatePersonalBest = (pbMs: number) => {
    if (!user) return;
    const updated = {
      ...user,
      personalBestSoloMs:
        user.personalBestSoloMs == null
          ? pbMs
          : Math.min(user.personalBestSoloMs, pbMs),
    };
    setUser(updated);
    if (user.id.startsWith('guest_')) {
      localStorage.setItem('nostalgic_guest_user', JSON.stringify(updated));
    }
  };

  const levelProgress = getLevelProgress(user?.avatar?.xpTotal || 0);
  const isGuest = user ? user.id.startsWith('guest_') : true;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isGuest,
        levelProgress,
        login,
        register,
        logout,
        updateAvatarState,
        updatePersonalBest,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
