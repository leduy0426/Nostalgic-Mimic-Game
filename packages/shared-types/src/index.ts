import { z } from 'zod';

// ==========================================
// 1. Enums & Constants
// ==========================================
export const GameTypeEnum = z.enum(['NUMBER_HUNT', 'CARO', 'MEMORY']);
export type GameType = z.infer<typeof GameTypeEnum>;

export const GameModeEnum = z.enum(['SOLO', 'PVP']);
export type GameMode = z.infer<typeof GameModeEnum>;

export const MatchOutcomeEnum = z.enum(['WIN', 'LOSS', 'DRAW']);
export type MatchOutcome = z.infer<typeof MatchOutcomeEnum>;

export const RoomStatusEnum = z.enum([
  'WAITING',
  'READY',
  'COUNTDOWN',
  'PLAYING',
  'FINISHED',
]);
export type RoomStatus = z.infer<typeof RoomStatusEnum>;

// ==========================================
// 2. Auth & User DTOs
// ==========================================
export const RegisterSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  nickname: z
    .string()
    .min(3, 'Biệt danh tối thiểu 3 ký tự')
    .max(20, 'Biệt danh tối đa 20 ký tự')
    .regex(/^[a-zA-Z0-9_]+$/, 'Biệt danh chỉ gồm chữ cái, số và gạch dưới'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
});
export type RegisterDto = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});
export type LoginDto = z.infer<typeof LoginSchema>;

export interface UserProfileDto {
  id: string;
  email: string;
  nickname: string;
  role: string;
  createdAt: string;
  avatar: AvatarDto;
  personalBestSoloMs?: number | null;
}

// ==========================================
// 3. Avatar & Progression
// ==========================================
export const AvatarColorEnum = z.enum([
  'retro-yellow',
  'retro-blue',
  'retro-green',
  'retro-red',
  'retro-purple',
]);
export type AvatarColor = z.infer<typeof AvatarColorEnum>;

export const AvatarHatEnum = z.enum(['none', 'student-cap', 'retro-cap', 'bunny-ears', 'wizard']);
export type AvatarHat = z.infer<typeof AvatarHatEnum>;

export const AvatarGlassesEnum = z.enum(['none', 'classic', 'pixel-shades', 'nerd']);
export type AvatarGlasses = z.infer<typeof AvatarGlassesEnum>;

export interface AvatarDto {
  id: string;
  userId: string;
  color: AvatarColor;
  hat: AvatarHat;
  glasses: AvatarGlasses;
  accessory: string;
  xpTotal: number;
  level: number;
}

export const UpdateAvatarSchema = z.object({
  color: AvatarColorEnum.optional(),
  hat: AvatarHatEnum.optional(),
  glasses: AvatarGlassesEnum.optional(),
  accessory: z.string().optional(),
});
export type UpdateAvatarDto = z.infer<typeof UpdateAvatarSchema>;

export interface LevelProgressDto {
  currentLevel: number;
  currentXp: number;
  nextLevelXp: number;
  progressPercent: number;
}

// Helper function to calculate level from total XP
// Level = floor(sqrt(XP / 100)) + 1
export function calculateLevel(xpTotal: number): number {
  if (xpTotal < 0) return 1;
  return Math.floor(Math.sqrt(xpTotal / 100)) + 1;
}

export function getXpForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.pow(level - 1, 2) * 100;
}

export function getLevelProgress(xpTotal: number): LevelProgressDto {
  const currentLevel = calculateLevel(xpTotal);
  const currentLevelBaseXp = getXpForLevel(currentLevel);
  const nextLevelBaseXp = getXpForLevel(currentLevel + 1);
  const xpInCurrentLevel = xpTotal - currentLevelBaseXp;
  const xpNeededForNext = nextLevelBaseXp - currentLevelBaseXp;
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round((xpInCurrentLevel / xpNeededForNext) * 100))
  );

  return {
    currentLevel,
    currentXp: xpTotal,
    nextLevelXp: nextLevelBaseXp,
    progressPercent,
  };
}

// ==========================================
// 4. Solo Number Hunt DTOs
// ==========================================
export interface StartSoloResponse {
  sessionId: string;
  board: number[]; // 25 shuffled numbers (1..25)
  targetNumber: number;
  startedAt: number;
}

export const FinishSoloSchema = z.object({
  sessionId: z.string().uuid(),
  clientCompletionTimeMs: z.number().int().positive(),
  clicksLog: z
    .array(
      z.object({
        number: z.number().int().min(1).max(25),
        timestampMs: z.number().int().positive(),
      })
    )
    .optional(),
});
export type FinishSoloRequest = z.infer<typeof FinishSoloSchema>;

export interface FinishSoloResponse {
  status: 'SUCCESS' | 'ALREADY_PROCESSED' | 'REJECTED';
  completionTimeMs: number;
  isNewPersonalBest: boolean;
  personalBestMs: number;
  xpAwarded: number;
  avatar: AvatarDto;
  reason?: string;
}

// ==========================================
// 5. Real-time PvP Socket Contracts
// ==========================================
export interface RoomPlayer {
  id: string;
  socketId: string;
  nickname: string;
  avatar: AvatarDto;
  isReady: boolean;
  score: number;
  isConnected: boolean;
}

export interface RoomState {
  roomId: string;
  roomCode: string;
  status: RoomStatus;
  players: Record<string, RoomPlayer>; // key is playerId
  board: number[]; // 25 numbers
  targetNumber: number; // 1..26
  claimedCells: Record<number, string>; // number -> playerId
  winnerId?: string | null;
  startedAt?: number;
  endedAt?: number;
}

// Socket Events Client -> Server
export interface ClientToServerEvents {
  'room:create': (callback: (response: { status: 'OK' | 'ERROR'; room?: RoomState; error?: string }) => void) => void;
  'room:join': (
    payload: { roomCode: string },
    callback: (response: { status: 'OK' | 'ERROR'; room?: RoomState; error?: string }) => void
  ) => void;
  'room:ready': (
    payload: { isReady: boolean },
    callback: (response: { status: 'OK' | 'ERROR'; room?: RoomState; error?: string }) => void
  ) => void;
  'room:claim': (
    payload: { number: number },
    callback?: (response: { status: 'ACCEPTED' | 'REJECTED'; reason?: string }) => void
  ) => void;
  'room:rematch': (callback: (response: { status: 'OK' | 'ERROR' }) => void) => void;
}

// Socket Events Server -> Client
export interface ServerToClientEvents {
  'room:updated': (room: RoomState) => void;
  'room:countdown': (count: number) => void;
  'match:start': (payload: { board: number[]; targetNumber: number }) => void;
  'claim:accepted': (payload: {
    number: number;
    claimedBy: string;
    nextTarget: number;
    scores: Record<string, number>;
  }) => void;
  'claim:rejected': (payload: {
    number: number;
    reason: 'ALREADY_CLAIMED' | 'INVALID_NUMBER' | 'GAME_NOT_ACTIVE';
    currentTarget: number;
  }) => void;
  'match:game_over': (payload: {
    winnerId: string | null;
    isDraw: boolean;
    scores: Record<string, number>;
    xpAwarded: Record<string, number>;
    reason?: string;
  }) => void;
  'player:disconnected': (payload: { playerId: string; gracePeriodSeconds: number }) => void;
  'player:reconnected': (payload: { playerId: string }) => void;
}
