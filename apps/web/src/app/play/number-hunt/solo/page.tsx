'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Clock, Trophy, Play, RotateCcw } from 'lucide-react';
import { NumberGrid } from '@/components/game/number-grid';
import { ResultModal } from '@/components/game/result-modal';
import { useAuth } from '@/hooks/use-auth';
import { soundManager } from '@/lib/sound-effects';
import { StartSoloResponse, FinishSoloResponse } from '@repo/shared-types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function SoloNumberHuntPage() {
  const router = useRouter();
  const { user, updateAvatarState, updatePersonalBest } = useAuth();

  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'FINISHED'>('IDLE');
  const [board, setBoard] = useState<number[]>([]);
  const [targetNumber, setTargetNumber] = useState<number>(1);
  const [sessionId, setSessionId] = useState<string>('');
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Result state
  const [showResult, setShowResult] = useState<boolean>(false);
  const [resultData, setResultData] = useState<{
    completionTimeMs: number;
    isNewPersonalBest: boolean;
    personalBestMs: number;
    xpAwarded: number;
  }>({
    completionTimeMs: 0,
    isNewPersonalBest: false,
    personalBestMs: user?.personalBestSoloMs || 0,
    xpAwarded: 0,
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Fallback board generator for offline client play
  const generateClientBoard = (): number[] => {
    const arr = Array.from({ length: 25 }, (_, i) => i + 1);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    }
    return arr;
  };

  const startNewGame = async () => {
    soundManager.playClick();
    setIsLoading(true);
    setShowResult(false);
    setTargetNumber(1);
    setElapsedMs(0);

    try {
      const res = await fetch(`${API_URL}/api/game/solo/start`, {
        method: 'POST',
        credentials: 'include',
      });

      if (res.ok) {
        const data: StartSoloResponse = await res.json();
        setBoard(data.board);
        setSessionId(data.sessionId);
      } else {
        throw new Error('Fallback to client board');
      }
    } catch {
      // Local fallback mode
      setBoard(generateClientBoard());
      setSessionId('client_session_' + Date.now());
    } finally {
      setIsLoading(false);
      setGameState('PLAYING');
      startTimeRef.current = Date.now();

      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setElapsedMs(Date.now() - startTimeRef.current);
      }, 30);
    }
  };

  const handleNumberClick = async (clickedNum: number) => {
    if (gameState !== 'PLAYING') return;

    if (clickedNum === targetNumber) {
      const nextTarget = targetNumber + 1;
      setTargetNumber(nextTarget);

      // Check if finished (completed 25)
      if (nextTarget > 25) {
        const finalTimeMs = Date.now() - startTimeRef.current;
        if (timerRef.current) clearInterval(timerRef.current);
        setElapsedMs(finalTimeMs);
        setGameState('FINISHED');

        // Submit to backend
        try {
          const res = await fetch(`${API_URL}/api/game/solo/finish`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId,
              clientCompletionTimeMs: finalTimeMs,
            }),
            credentials: 'include',
          });

          if (res.ok) {
            const data: FinishSoloResponse = await res.json();
            setResultData({
              completionTimeMs: data.completionTimeMs,
              isNewPersonalBest: data.isNewPersonalBest,
              personalBestMs: data.personalBestMs,
              xpAwarded: data.xpAwarded,
            });
            if (data.avatar?.xpTotal) {
              updateAvatarState(data.avatar);
            }
            if (data.isNewPersonalBest) {
              updatePersonalBest(data.completionTimeMs);
            }
          } else {
            throw new Error('Local record update');
          }
        } catch {
          // Offline fallback
          const isPB =
            !user?.personalBestSoloMs || finalTimeMs < user.personalBestSoloMs;
          if (isPB) updatePersonalBest(finalTimeMs);
          setResultData({
            completionTimeMs: finalTimeMs,
            isNewPersonalBest: isPB,
            personalBestMs: isPB
              ? finalTimeMs
              : user?.personalBestSoloMs || finalTimeMs,
            xpAwarded: 10,
          });
        }

        setShowResult(true);
      }
    }
  };

  useEffect(() => {
    // Auto start on first visit
    startNewGame();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTimer = (ms: number) => {
    const sec = Math.floor(ms / 1000);
    const millis = Math.floor((ms % 1000) / 10);
    return `${sec}.${millis.toString().padStart(2, '0')}s`;
  };

  return (
    <div className="max-w-xl mx-auto space-y-5 animate-fade-in">
      {/* Top Navigation */}
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

        <div className="flex items-center gap-2">
          {user?.personalBestSoloMs && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-ink bg-retro-amber/20 text-xs font-bold shadow-retro-sm">
              <Trophy className="w-4 h-4 text-retro-amber" />
              <span>PB: {formatTimer(user.personalBestSoloMs)}</span>
            </div>
          )}

          <button
            onClick={startNewGame}
            disabled={isLoading}
            className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl border-2 border-ink bg-retro-blue text-paper transition shadow-retro-sm btn-retro"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Chơi Lại</span>
          </button>
        </div>
      </div>

      {/* Target & Stopwatch Bar */}
      <div className="grid grid-cols-2 gap-3">
        {/* Next Target */}
        <div className="rounded-2xl border-3 border-ink bg-paper p-3 shadow-retro-sm flex items-center justify-between">
          <div className="text-left">
            <div className="text-[10px] text-ink-muted font-black uppercase tracking-wider">
              Số Cần Bấm
            </div>
            <div className="text-3xl font-black font-mono text-retro-blue">
              {targetNumber <= 25 ? targetNumber : 'Xong!'}
            </div>
          </div>
          <div className="text-xs font-bold text-ink-muted">
            {targetNumber - 1} / 25
          </div>
        </div>

        {/* Stopwatch */}
        <div className="rounded-2xl border-3 border-ink bg-paper p-3 shadow-retro-sm flex items-center justify-between">
          <div className="text-left">
            <div className="text-[10px] text-ink-muted font-black uppercase tracking-wider">
              Thời Gian
            </div>
            <div className="text-3xl font-black font-mono text-ink">
              {formatTimer(elapsedMs)}
            </div>
          </div>
          <Clock className="w-6 h-6 text-retro-blue animate-pulse" />
        </div>
      </div>

      {/* 5x5 Number Grid */}
      <NumberGrid
        board={board}
        currentTarget={targetNumber}
        onNumberClick={handleNumberClick}
        disabled={gameState !== 'PLAYING' || isLoading}
      />

      {/* Hint */}
      <p className="text-center text-xs text-ink-muted font-medium">
        Bấm lần lượt từ số 1 đến 25. Thời gian được tính ngay khi bạn vào ván!
      </p>

      {/* Result Modal */}
      <ResultModal
        isOpen={showResult}
        completionTimeMs={resultData.completionTimeMs}
        isNewPersonalBest={resultData.isNewPersonalBest}
        personalBestMs={resultData.personalBestMs}
        xpAwarded={resultData.xpAwarded}
        avatar={user?.avatar}
        nickname={user?.nickname || 'Bạn'}
        onPlayAgain={startNewGame}
        onBackToHub={() => router.push('/')}
      />
    </div>
  );
}
