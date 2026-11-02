import { prisma } from '@repo/database';
import {
  StartSoloResponse,
  FinishSoloRequest,
  FinishSoloResponse,
  AvatarDto,
} from '@repo/shared-types';
import { generateNumberHuntBoard } from './board-generator';
import { avatarService } from '../../avatar/avatar.service';

export class SoloService {
  async startSolo(userId?: string): Promise<StartSoloResponse> {
    const board = generateNumberHuntBoard();

    const session = await prisma.gameSession.create({
      data: {
        gameType: 'NUMBER_HUNT',
        mode: 'SOLO',
        boardSeed: JSON.stringify(board),
        status: 'ACTIVE',
        startedAt: new Date(),
        participants: userId
          ? {
              create: {
                userId,
                score: 0,
              },
            }
          : undefined,
      },
    });

    return {
      sessionId: session.id,
      board,
      targetNumber: 1,
      startedAt: session.startedAt.getTime(),
    };
  }

  async finishSolo(
    req: FinishSoloRequest,
    userId?: string
  ): Promise<FinishSoloResponse> {
    const session = await prisma.gameSession.findUnique({
      where: { id: req.sessionId },
      include: {
        results: {
          take: 1,
        },
      },
    });

    if (!session) {
      throw new Error('Phiên chơi không tồn tại');
    }

    // Idempotency check: If session is already completed, return existing result without re-awarding XP
    if (session.status === 'COMPLETED' && session.results.length > 0) {
      const existingResult = session.results[0];
      const avatar = userId
        ? (await avatarService.getAvatar(userId)).avatar
        : ({} as AvatarDto);

      return {
        status: 'ALREADY_PROCESSED',
        completionTimeMs: existingResult.completionTimeMs || req.clientCompletionTimeMs,
        isNewPersonalBest: false,
        personalBestMs: existingResult.completionTimeMs || req.clientCompletionTimeMs,
        xpAwarded: 0,
        avatar,
        reason: 'Phiên chơi đã được ghi nhận trước đó',
      };
    }

    const now = Date.now();
    const serverElapsedMs = now - session.startedAt.getTime();

    // Anti-cheat: Minimum physical human time to find and click 25 numbers is at least 3 seconds
    if (serverElapsedMs < 3000 || req.clientCompletionTimeMs < 3000) {
      return {
        status: 'REJECTED',
        completionTimeMs: serverElapsedMs,
        isNewPersonalBest: false,
        personalBestMs: 0,
        xpAwarded: 0,
        avatar: ({} as any),
        reason: 'Thời gian hoàn thành bất thường (chống gian lận)',
      };
    }

    const verifiedCompletionTimeMs = Math.round(
      Math.max(req.clientCompletionTimeMs, serverElapsedMs - 1500)
    );

    // Save GameResult and mark session COMPLETED
    const result = await prisma.$transaction(async (tx) => {
      await tx.gameSession.update({
        where: { id: session.id },
        data: {
          status: 'COMPLETED',
          endedAt: new Date(),
        },
      });

      return await tx.gameResult.create({
        data: {
          sessionId: session.id,
          userId: userId || null,
          completionTimeMs: verifiedCompletionTimeMs,
          outcome: 'WIN',
        },
      });
    });

    let isNewPersonalBest = false;
    let personalBestMs = verifiedCompletionTimeMs;
    let xpAwarded = 0;
    let userAvatar: AvatarDto = {} as any;

    if (userId) {
      // Calculate XP
      let xpDelta = 10; // Base solo completion XP
      if (verifiedCompletionTimeMs < 30000) {
        xpDelta += 15; // Bonus for sub-30s speed
      }

      // Check personal best
      const existingPb = await prisma.personalBest.findUnique({
        where: {
          userId_gameType_mode: {
            userId,
            gameType: 'NUMBER_HUNT',
            mode: 'SOLO',
          },
        },
      });

      if (!existingPb || verifiedCompletionTimeMs < existingPb.bestValueMs) {
        isNewPersonalBest = true;
        await prisma.personalBest.upsert({
          where: {
            userId_gameType_mode: {
              userId,
              gameType: 'NUMBER_HUNT',
              mode: 'SOLO',
            },
          },
          update: {
            bestValueMs: verifiedCompletionTimeMs,
            resultId: result.id,
          },
          create: {
            userId,
            gameType: 'NUMBER_HUNT',
            mode: 'SOLO',
            bestValueMs: verifiedCompletionTimeMs,
            resultId: result.id,
          },
        });
        personalBestMs = verifiedCompletionTimeMs;
      } else {
        personalBestMs = existingPb.bestValueMs;
      }

      // Idempotent XP award
      const xpResult = await avatarService.awardXpIdempotent(
        userId,
        result.id,
        xpDelta,
        `Hoàn thành Number Hunt Solo (${(verifiedCompletionTimeMs / 1000).toFixed(2)}s)`
      );

      xpAwarded = xpResult.xpAwarded;
      userAvatar = xpResult.avatar;
    }

    return {
      status: 'SUCCESS',
      completionTimeMs: verifiedCompletionTimeMs,
      isNewPersonalBest,
      personalBestMs,
      xpAwarded,
      avatar: userAvatar,
    };
  }
}

export const soloService = new SoloService();

