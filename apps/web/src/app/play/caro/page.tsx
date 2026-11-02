'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, RotateCcw, Trophy, User } from 'lucide-react';
import { soundManager } from '@/lib/sound-effects';
import confetti from 'canvas-confetti';

const BOARD_SIZE = 15;

export default function CaroPage() {
  const router = useRouter();
  const [board, setBoard] = useState<(string | null)[][]>(() =>
    Array(BOARD_SIZE)
      .fill(null)
      .map(() => Array(BOARD_SIZE).fill(null))
  );
  const [isXNext, setIsXNext] = useState<boolean>(true);
  const [winner, setWinner] = useState<string | null>(null);
  const [winningLine, setWinningLine] = useState<[number, number][]>([]);

  // Check 5-in-a-row
  const checkWinner = (
    grid: (string | null)[][],
    r: number,
    c: number,
    player: string
  ): [number, number][] | null => {
    const directions = [
      [0, 1], // horizontal
      [1, 0], // vertical
      [1, 1], // diagonal down-right
      [1, -1], // diagonal up-right
    ];

    for (const [dr, dc] of directions) {
      const line: [number, number][] = [[r, c]];

      // forward
      let step = 1;
      while (true) {
        const nr = r + dr * step;
        const nc = c + dc * step;
        if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && grid[nr][nc] === player) {
          line.push([nr, nc]);
          step++;
        } else {
          break;
        }
      }

      // backward
      step = 1;
      while (true) {
        const nr = r - dr * step;
        const nc = c - dc * step;
        if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && grid[nr][nc] === player) {
          line.push([nr, nc]);
          step++;
        } else {
          break;
        }
      }

      if (line.length >= 5) {
        return line;
      }
    }

    return null;
  };

  const handleCellClick = (r: number, c: number) => {
    if (board[r][c] || winner) return;

    soundManager.playClick();
    const currentPlayer = isXNext ? 'X' : 'O';
    const newBoard = board.map((row) => [...row]);
    newBoard[r][c] = currentPlayer;
    setBoard(newBoard);

    const winLine = checkWinner(newBoard, r, c, currentPlayer);
    if (winLine) {
      setWinner(currentPlayer);
      setWinningLine(winLine);
      soundManager.playVictory();
      confetti({ particleCount: 70, spread: 60 });
    } else {
      setIsXNext(!isXNext);
    }
  };

  const resetGame = () => {
    soundManager.playClick();
    setBoard(
      Array(BOARD_SIZE)
        .fill(null)
        .map(() => Array(BOARD_SIZE).fill(null))
    );
    setIsXNext(true);
    setWinner(null);
    setWinningLine([]);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
      {/* Header */}
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
          onClick={resetGame}
          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border-2 border-ink bg-retro-amber text-ink transition shadow-retro-sm btn-retro"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Ván Mới</span>
        </button>
      </div>

      {/* Turn & Status Bar */}
      <div className="rounded-2xl border-3 border-ink bg-paper p-4 shadow-retro-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl border-2 border-ink flex items-center justify-center font-black text-xl shadow-retro-sm ${
              isXNext ? 'bg-retro-blue text-paper' : 'bg-retro-red text-paper'
            }`}
          >
            {isXNext ? 'X' : 'O'}
          </div>
          <div>
            <div className="text-[10px] text-ink-muted font-black uppercase tracking-wider">
              {winner ? 'Kết Thúc' : 'Lượt Đi Hiện Tại'}
            </div>
            <div className="text-base font-black text-ink">
              {winner
                ? `Người Chơi ${winner} Thắng!`
                : `Lượt của ${isXNext ? 'Người Chơi X (Xanh)' : 'Người Chơi O (Đỏ)'}`}
            </div>
          </div>
        </div>

        {winner && (
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full border-2 border-ink bg-retro-amber text-ink font-black text-xs uppercase animate-bounce">
            <Trophy className="w-4 h-4" />
            <span>Thắng 5 Ô!</span>
          </div>
        )}
      </div>

      {/* 15x15 Caro Grid */}
      <div className="w-full aspect-square max-w-xl mx-auto rounded-3xl border-4 border-ink bg-paper p-2 shadow-retro overflow-hidden">
        <div className="w-full h-full grid grid-cols-15 grid-rows-15 gap-[1px] bg-paper-border border-2 border-ink">
          {board.map((row, r) =>
            row.map((cell, c) => {
              const isWinningCell = winningLine.some(([wr, wc]) => wr === r && wc === c);

              return (
                <button
                  key={`${r}-${c}`}
                  type="button"
                  onClick={() => handleCellClick(r, c)}
                  disabled={!!cell || !!winner}
                  className={`w-full h-full flex items-center justify-center text-xs sm:text-sm md:text-base font-black select-none transition-colors ${
                    isWinningCell
                      ? 'bg-retro-amber animate-pulse font-extrabold'
                      : 'bg-paper hover:bg-paper-panel'
                  }`}
                  style={{ aspectRatio: '1/1' }}
                >
                  {cell === 'X' && (
                    <span className="text-retro-blue font-extrabold">X</span>
                  )}
                  {cell === 'O' && (
                    <span className="text-retro-red font-extrabold">O</span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      <p className="text-center text-xs text-ink-muted font-medium">
        Đánh 5 quân cờ liên tiếp theo hàng ngang, dọc hoặc đường chéo để giành chiến thắng.
      </p>
    </div>
  );
}

