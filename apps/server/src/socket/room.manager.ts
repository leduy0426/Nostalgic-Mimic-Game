import { Server, Socket } from 'socket.io';
import {
  RoomState,
  RoomPlayer,
  ClientToServerEvents,
  ServerToClientEvents,
  AvatarDto,
} from '@repo/shared-types';
import { generateNumberHuntBoard } from '../modules/game/solo/board-generator';
import { prisma } from '@repo/database';
import { avatarService } from '../modules/avatar/avatar.service';

export class RoomManager {
  private rooms: Map<string, RoomState> = new Map();
  // Map socketId -> { roomId, playerId }
  private socketToRoom: Map<string, { roomId: string; playerId: string }> = new Map();
  // Map playerId -> disconnect timer
  private disconnectTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor(private io: Server<ClientToServerEvents, ServerToClientEvents>) {}

  private generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'NH-';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  createRoom(socket: Socket, player: { id: string; nickname: string; avatar: AvatarDto }): RoomState {
    const roomId = 'room_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const roomCode = this.generateRoomCode();

    const roomPlayer: RoomPlayer = {
      id: player.id,
      socketId: socket.id,
      nickname: player.nickname,
      avatar: player.avatar,
      isReady: false,
      score: 0,
      isConnected: true,
    };

    const roomState: RoomState = {
      roomId,
      roomCode,
      status: 'WAITING',
      players: { [player.id]: roomPlayer },
      board: generateNumberHuntBoard(),
      targetNumber: 1,
      claimedCells: {},
      winnerId: null,
    };

    this.rooms.set(roomId, roomState);
    this.socketToRoom.set(socket.id, { roomId, playerId: player.id });
    socket.join(roomId);

    return roomState;
  }

  joinRoom(
    socket: Socket,
    roomCode: string,
    player: { id: string; nickname: string; avatar: AvatarDto }
  ): { status: 'OK'; room: RoomState } | { status: 'ERROR'; error: string } {
    const room = Array.from(this.rooms.values()).find(
      (r) => r.roomCode.toUpperCase() === roomCode.toUpperCase()
    );

    if (!room) {
      return { status: 'ERROR', error: 'Không tìm thấy phòng chơi' };
    }

    // Check if player is already in this room (reconnecting)
    if (room.players[player.id]) {
      const existing = room.players[player.id];
      existing.socketId = socket.id;
      existing.isConnected = true;

      // Cancel disconnect timer if active
      if (this.disconnectTimers.has(player.id)) {
        clearTimeout(this.disconnectTimers.get(player.id)!);
        this.disconnectTimers.delete(player.id);
      }

      this.socketToRoom.set(socket.id, { roomId: room.roomId, playerId: player.id });
      socket.join(room.roomId);

      this.io.to(room.roomId).emit('player:reconnected', { playerId: player.id });
      this.io.to(room.roomId).emit('room:updated', room);

      return { status: 'OK', room };
    }

    // Check if room is full
    const currentCount = Object.keys(room.players).length;
    if (currentCount >= 2) {
      return { status: 'ERROR', error: 'Phòng đã đủ 2 người chơi' };
    }

    if (room.status !== 'WAITING' && room.status !== 'READY') {
      return { status: 'ERROR', error: 'Ván chơi đang diễn ra' };
    }

    const roomPlayer: RoomPlayer = {
      id: player.id,
      socketId: socket.id,
      nickname: player.nickname,
      avatar: player.avatar,
      isReady: false,
      score: 0,
      isConnected: true,
    };

    room.players[player.id] = roomPlayer;
    room.status = 'READY';

    this.socketToRoom.set(socket.id, { roomId: room.roomId, playerId: player.id });
    socket.join(room.roomId);

    this.io.to(room.roomId).emit('room:updated', room);
    return { status: 'OK', room };
  }

  toggleReady(socket: Socket, isReady: boolean): { status: 'OK'; room: RoomState } | { status: 'ERROR'; error: string } {
    const session = this.socketToRoom.get(socket.id);
    if (!session) return { status: 'ERROR', error: 'Bạn chưa ở trong phòng nào' };

    const room = this.rooms.get(session.roomId);
    if (!room || !room.players[session.playerId]) {
      return { status: 'ERROR', error: 'Không tìm thấy thông tin phòng' };
    }

    room.players[session.playerId].isReady = isReady;
    this.io.to(room.roomId).emit('room:updated', room);

    // Check if both players are ready
    const players = Object.values(room.players);
    if (players.length === 2 && players.every((p) => p.isReady)) {
      this.startCountdown(room);
    }

    return { status: 'OK', room };
  }

  private startCountdown(room: RoomState) {
    room.status = 'COUNTDOWN';
    room.board = generateNumberHuntBoard(); // fresh board
    room.targetNumber = 1;
    room.claimedCells = {};
    for (const p of Object.values(room.players)) {
      p.score = 0;
    }
    this.io.to(room.roomId).emit('room:updated', room);

    let count = 3;
    const interval = setInterval(() => {
      this.io.to(room.roomId).emit('room:countdown', count);
      count--;
      if (count < 0) {
        clearInterval(interval);
        room.status = 'PLAYING';
        room.startedAt = Date.now();
        this.io.to(room.roomId).emit('match:start', {
          board: room.board,
          targetNumber: 1,
        });
        this.io.to(room.roomId).emit('room:updated', room);
      }
    }, 1000);
  }

  /**
   * Authoritative Atomic Claim Arbiter
   */
  handleClaim(socket: Socket, number: number) {
    const session = this.socketToRoom.get(socket.id);
    if (!session) return;

    const room = this.rooms.get(session.roomId);
    if (!room || room.status !== 'PLAYING') {
      socket.emit('claim:rejected', {
        number,
        reason: 'GAME_NOT_ACTIVE',
        currentTarget: room ? room.targetNumber : 1,
      });
      return;
    }

    const { playerId } = session;

    // Check if this matches the authoritative required number
    if (number === room.targetNumber) {
      // Award point to the fastest claimer
      room.players[playerId].score += 1;
      room.claimedCells[number] = playerId;
      room.targetNumber += 1;

      const scores: Record<string, number> = {};
      for (const [id, p] of Object.entries(room.players)) {
        scores[id] = p.score;
      }

      // Broadcast valid claim to both players immediately
      this.io.to(room.roomId).emit('claim:accepted', {
        number,
        claimedBy: playerId,
        nextTarget: room.targetNumber,
        scores,
      });

      // Check if match is finished (all 25 numbers claimed)
      if (room.targetNumber > 25) {
        this.finishMatch(room);
      }
    } else {
      // Stale or incorrect click
      socket.emit('claim:rejected', {
        number,
        reason: 'ALREADY_CLAIMED',
        currentTarget: room.targetNumber,
      });
    }
  }

  private async finishMatch(room: RoomState) {
    room.status = 'FINISHED';
    room.endedAt = Date.now();

    const players = Object.values(room.players);
    if (players.length !== 2) return;

    const [p1, p2] = players;
    let winnerId: string | null = null;
    let isDraw = false;

    if (p1.score > p2.score) {
      winnerId = p1.id;
    } else if (p2.score > p1.score) {
      winnerId = p2.id;
    } else {
      isDraw = true;
    }

    room.winnerId = winnerId;

    const scores: Record<string, number> = {
      [p1.id]: p1.score,
      [p2.id]: p2.score,
    };

    const xpAwarded: Record<string, number> = {
      [p1.id]: winnerId === p1.id ? 50 : 15,
      [p2.id]: winnerId === p2.id ? 50 : 15,
    };

    // Broadcast Game Over immediately
    this.io.to(room.roomId).emit('match:game_over', {
      winnerId,
      isDraw,
      scores,
      xpAwarded,
    });
    this.io.to(room.roomId).emit('room:updated', room);

    // Asynchronously persist match and award XP in database
    try {
      const dbSession = await prisma.gameSession.create({
        data: {
          gameType: 'NUMBER_HUNT',
          mode: 'PVP',
          status: 'COMPLETED',
          startedAt: new Date(room.startedAt || Date.now() - 30000),
          endedAt: new Date(room.endedAt),
          participants: {
            create: [
              {
                userId: p1.id.startsWith('guest_') ? undefined : p1.id,
                guestName: p1.id.startsWith('guest_') ? p1.nickname : undefined,
                score: p1.score,
                outcome: winnerId === p1.id ? 'WIN' : isDraw ? 'DRAW' : 'LOSS',
              },
              {
                userId: p2.id.startsWith('guest_') ? undefined : p2.id,
                guestName: p2.id.startsWith('guest_') ? p2.nickname : undefined,
                score: p2.score,
                outcome: winnerId === p2.id ? 'WIN' : isDraw ? 'DRAW' : 'LOSS',
              },
            ],
          },
        },
      });

      // Award XP for registered players
      for (const p of players) {
        if (!p.id.startsWith('guest_')) {
          const res = await prisma.gameResult.create({
            data: {
              sessionId: dbSession.id,
              userId: p.id,
              outcome: winnerId === p.id ? 'WIN' : isDraw ? 'DRAW' : 'LOSS',
            },
          });

          await avatarService.awardXpIdempotent(
            p.id,
            res.id,
            xpAwarded[p.id],
            `Đối kháng Number Hunt PvP (${scores[p.id]}/25 điểm)`
          );
        }
      }
    } catch (err) {
      console.error('Error persisting PvP match:', err);
    }
  }

  handleDisconnect(socket: Socket) {
    const session = this.socketToRoom.get(socket.id);
    if (!session) return;

    this.socketToRoom.delete(socket.id);
    const room = this.rooms.get(session.roomId);
    if (!room) return;

    const player = room.players[session.playerId];
    if (!player) return;

    player.isConnected = false;

    // If match is active, grant 15 seconds grace period
    if (room.status === 'PLAYING') {
      this.io.to(room.roomId).emit('player:disconnected', {
        playerId: player.id,
        gracePeriodSeconds: 15,
      });

      const timer = setTimeout(() => {
        // Player failed to reconnect: remaining player wins by forfeit
        const remaining = Object.values(room.players).find((p) => p.id !== player.id);
        if (remaining && room.status === 'PLAYING') {
          room.winnerId = remaining.id;
          room.status = 'FINISHED';
          this.io.to(room.roomId).emit('match:game_over', {
            winnerId: remaining.id,
            isDraw: false,
            scores: { [remaining.id]: remaining.score, [player.id]: player.score },
            xpAwarded: { [remaining.id]: 50, [player.id]: 0 },
            reason: `Người chơi ${player.nickname} mất kết nối quá thời gian chờ (xử thắng đối thủ).`,
          });
        }
        this.disconnectTimers.delete(player.id);
      }, 15000);

      this.disconnectTimers.set(player.id, timer);
    } else {
      // If waiting in lobby, remove player from room
      delete room.players[player.id];
      if (Object.keys(room.players).length === 0) {
        this.rooms.delete(room.roomId);
      } else {
        room.status = 'WAITING';
        this.io.to(room.roomId).emit('room:updated', room);
      }
    }
  }
}
