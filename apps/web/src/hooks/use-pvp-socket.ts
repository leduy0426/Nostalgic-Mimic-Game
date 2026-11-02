'use client';

import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  RoomState,
  ClientToServerEvents,
  ServerToClientEvents,
  UserProfileDto,
} from '@repo/shared-types';
import { soundManager } from '@/lib/sound-effects';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

export function usePvPSocket(user: UserProfileDto | null) {
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [room, setRoom] = useState<RoomState | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [matchOverData, setMatchOverData] = useState<{
    winnerId: string | null;
    isDraw: boolean;
    scores: Record<string, number>;
    xpAwarded: Record<string, number>;
    reason?: string;
  } | null>(null);
  const [disconnectNotice, setDisconnectNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    (socket as any).data = {
      player: {
        id: user.id,
        nickname: user.nickname,
        avatar: user.avatar,
      },
    };

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('room:updated', (updatedRoom) => {
      setRoom(updatedRoom);
    });

    socket.on('room:countdown', (count) => {
      setCountdown(count);
      soundManager.playTick();
      if (count === 0) setCountdown(null);
    });

    socket.on('match:start', ({ board, targetNumber }) => {
      setCountdown(null);
      soundManager.playClick();
      setMatchOverData(null);
    });

    socket.on('claim:accepted', ({ number, claimedBy, nextTarget, scores }) => {
      if (claimedBy === user.id) {
        soundManager.playCorrect();
      } else {
        soundManager.playClick();
      }
    });

    socket.on('claim:rejected', () => {
      soundManager.playWrong();
    });

    socket.on('match:game_over', (payload) => {
      setMatchOverData(payload);
      soundManager.playVictory();
    });

    socket.on('player:disconnected', ({ gracePeriodSeconds }) => {
      setDisconnectNotice(`Đối thủ mất kết nối. Đang chờ kết nối lại (${gracePeriodSeconds}s)...`);
    });

    socket.on('player:reconnected', () => {
      setDisconnectNotice(null);
    });

    return () => {
      socket.disconnect();
    };
  }, [user?.id]);

  const createRoom = () => {
    if (!socketRef.current) return;
    soundManager.playClick();
    socketRef.current.emit('room:create', (res) => {
      if (res.status === 'OK' && res.room) {
        setRoom(res.room);
      }
    });
  };

  const joinRoom = (roomCode: string, onFail?: (err: string) => void) => {
    if (!socketRef.current) return;
    soundManager.playClick();
    socketRef.current.emit('room:join', { roomCode }, (res) => {
      if (res.status === 'OK' && res.room) {
        setRoom(res.room);
      } else if (onFail) {
        onFail(res.error || 'Không thể tham gia phòng');
      }
    });
  };

  const toggleReady = (isReady: boolean) => {
    if (!socketRef.current) return;
    soundManager.playClick();
    socketRef.current.emit('room:ready', { isReady }, (res) => {
      if (res.status === 'OK' && res.room) {
        setRoom(res.room);
      }
    });
  };

  const claimNumber = (number: number) => {
    if (!socketRef.current) return;
    socketRef.current.emit('room:claim', { number });
  };

  return {
    isConnected,
    room,
    countdown,
    matchOverData,
    disconnectNotice,
    createRoom,
    joinRoom,
    toggleReady,
    claimNumber,
  };
}
