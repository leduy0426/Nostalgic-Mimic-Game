import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import jwt from '@fastify/jwt';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { authService } from './modules/auth/auth.service';
import { avatarService } from './modules/avatar/avatar.service';
import { soloService } from './modules/game/solo/solo.service';
import { RoomManager } from './socket/room.manager';
import {
  RegisterSchema,
  LoginSchema,
  UpdateAvatarSchema,
  FinishSoloSchema,
  ClientToServerEvents,
  ServerToClientEvents,
} from '@repo/shared-types';

const PORT = Number(process.env.PORT) || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-nostalgic-mimic-game-key-2026';
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

async function bootstrap() {
  const fastify = Fastify({
    logger: {
      level: 'info',
    },
  });

  // CORS
  await fastify.register(cors, {
    origin: [CORS_ORIGIN, 'http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
  });

  // Cookies
  await fastify.register(cookie);

  // JWT
  await fastify.register(jwt, {
    secret: JWT_SECRET,
    cookie: {
      cookieName: 'token',
      signed: false,
    },
  });

  // Auth Decorator
  fastify.decorate('authenticate', async (request: any, reply: any) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Yêu cầu đăng nhập' });
    }
  });

  // ==========================================
  // Auth Routes
  // ==========================================
  fastify.post('/api/auth/register', async (request, reply) => {
    const parseResult = RegisterSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: parseResult.error.errors[0]?.message || 'Dữ liệu không hợp lệ',
      });
    }

    try {
      const { user, tokenPayload } = await authService.register(parseResult.data);
      const token = fastify.jwt.sign(tokenPayload, { expiresIn: '7d' });

      reply.setCookie('token', token, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });

      return reply.send({ user, token });
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  });

  fastify.post('/api/auth/login', async (request, reply) => {
    const parseResult = LoginSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: parseResult.error.errors[0]?.message || 'Dữ liệu không hợp lệ',
      });
    }

    try {
      const { user, tokenPayload } = await authService.login(parseResult.data);
      const token = fastify.jwt.sign(tokenPayload, { expiresIn: '7d' });

      reply.setCookie('token', token, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });

      return reply.send({ user, token });
    } catch (err: any) {
      return reply.status(401).send({ error: err.message });
    }
  });

  fastify.post('/api/auth/logout', async (request, reply) => {
    reply.clearCookie('token', { path: '/' });
    return reply.send({ success: true });
  });

  fastify.get('/api/auth/me', { preHandler: [(fastify as any).authenticate] }, async (request: any, reply) => {
    try {
      const user = await authService.getMe(request.user.id);
      return reply.send({ user });
    } catch (err: any) {
      return reply.status(404).send({ error: err.message });
    }
  });

  // ==========================================
  // Avatar Routes
  // ==========================================
  fastify.get('/api/avatar/me', { preHandler: [(fastify as any).authenticate] }, async (request: any, reply) => {
    try {
      const result = await avatarService.getAvatar(request.user.id);
      return reply.send(result);
    } catch (err: any) {
      return reply.status(404).send({ error: err.message });
    }
  });

  fastify.patch('/api/avatar/me', { preHandler: [(fastify as any).authenticate] }, async (request: any, reply) => {
    const parseResult = UpdateAvatarSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({ error: 'Cấu hình avatar không hợp lệ' });
    }

    try {
      const avatar = await avatarService.updateAvatar(request.user.id, parseResult.data);
      return reply.send({ avatar });
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  });

  // ==========================================
  // Number Hunt Solo Routes
  // ==========================================
  fastify.post('/api/game/solo/start', async (request: any, reply) => {
    let userId: string | undefined;
    try {
      const decoded: any = await request.jwtVerify();
      userId = decoded.id;
    } catch {
      // Guest mode is permitted for Solo!
    }

    try {
      const result = await soloService.startSolo(userId);
      return reply.send(result);
    } catch (err: any) {
      return reply.status(500).send({ error: err.message });
    }
  });

  fastify.post('/api/game/solo/finish', async (request: any, reply) => {
    let userId: string | undefined;
    try {
      const decoded: any = await request.jwtVerify();
      userId = decoded.id;
    } catch {
      // Guest mode permitted
    }

    const parseResult = FinishSoloSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({ error: 'Dữ liệu kết thúc ván không hợp lệ' });
    }

    try {
      const result = await soloService.finishSolo(parseResult.data, userId);
      return reply.send(result);
    } catch (err: any) {
      return reply.status(500).send({ error: err.message });
    }
  });

  // Create Node HTTP Server to attach Fastify & Socket.io together on the same port
  const httpServer = createServer(fastify.server);

  const io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: {
      origin: [CORS_ORIGIN, 'http://localhost:3000', 'http://127.0.0.1:3000'],
      credentials: true,
    },
  });

  const roomManager = new RoomManager(io);

  io.on('connection', (socket) => {
    fastify.log.info(`Socket connected: ${socket.id}`);

    socket.on('room:create', (callback) => {
      const player = (socket.data as any)?.player || {
        id: 'guest_' + socket.id.substring(0, 5),
        nickname: 'HọcSinh_' + socket.id.substring(0, 4),
        avatar: {
          id: 'temp',
          userId: 'guest',
          color: 'retro-yellow',
          hat: 'none',
          glasses: 'none',
          accessory: 'none',
          xpTotal: 0,
          level: 1,
        },
      };

      const room = roomManager.createRoom(socket, player);
      callback({ status: 'OK', room });
    });

    socket.on('room:join', ({ roomCode }, callback) => {
      const player = (socket.data as any)?.player || {
        id: 'guest_' + socket.id.substring(0, 5),
        nickname: 'HọcSinh_' + socket.id.substring(0, 4),
        avatar: {
          id: 'temp',
          userId: 'guest',
          color: 'retro-blue',
          hat: 'none',
          glasses: 'none',
          accessory: 'none',
          xpTotal: 0,
          level: 1,
        },
      };

      const result = roomManager.joinRoom(socket, roomCode, player);
      callback(result);
    });

    socket.on('room:ready', ({ isReady }, callback) => {
      const result = roomManager.toggleReady(socket, isReady);
      callback(result);
    });

    socket.on('room:claim', ({ number }, callback) => {
      roomManager.handleClaim(socket, number);
      if (callback) {
        callback({ status: 'ACCEPTED' });
      }
    });

    socket.on('disconnect', () => {
      fastify.log.info(`Socket disconnected: ${socket.id}`);
      roomManager.handleDisconnect(socket);
    });
  });

  // Ready Fastify and listen
  await fastify.ready();
  httpServer.listen(PORT, '0.0.0.0', () => {
    fastify.log.info(`🎮 Nostalgic Game Server running on http://localhost:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('Fatal Server Bootstrap Error:', err);
  process.exit(1);
});

