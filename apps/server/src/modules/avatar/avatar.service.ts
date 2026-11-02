import { prisma } from '@repo/database';
import {
  AvatarDto,
  UpdateAvatarDto,
  calculateLevel,
  getLevelProgress,
  LevelProgressDto,
} from '@repo/shared-types';

export class AvatarService {
  async getAvatar(userId: string): Promise<{ avatar: AvatarDto; progress: LevelProgressDto }> {
    let avatar = await prisma.avatar.findUnique({
      where: { userId },
    });

    if (!avatar) {
      avatar = await prisma.avatar.create({
        data: {
          userId,
          color: 'retro-yellow',
          hat: 'none',
          glasses: 'none',
          accessory: 'none',
          xpTotal: 0,
          level: 1,
          coins: 50,
        },
      });
    }

    const avatarDto: AvatarDto = {
      id: avatar.id,
      userId: avatar.userId,
      color: avatar.color as any,
      hat: avatar.hat as any,
      glasses: avatar.glasses as any,
      accessory: avatar.accessory,
      xpTotal: avatar.xpTotal,
      level: avatar.level,
    };

    return {
      avatar: avatarDto,
      progress: getLevelProgress(avatar.xpTotal),
    };
  }

  async updateAvatar(userId: string, data: UpdateAvatarDto): Promise<AvatarDto> {
    const updated = await prisma.avatar.update({
      where: { userId },
      data: {
        ...(data.color ? { color: data.color } : {}),
        ...(data.hat ? { hat: data.hat } : {}),
        ...(data.glasses ? { glasses: data.glasses } : {}),
        ...(data.accessory ? { accessory: data.accessory } : {}),
      },
    });

    return {
      id: updated.id,
      userId: updated.userId,
      color: updated.color as any,
      hat: updated.hat as any,
      glasses: updated.glasses as any,
      accessory: updated.accessory,
      xpTotal: updated.xpTotal,
      level: updated.level,
    };
  }

  /**
   * Idempotently award XP for a completed game result.
   * If resultId was already rewarded, returns ALREADY_PROCESSED and 0 XP.
   */
  async awardXpIdempotent(
    userId: string,
    resultId: string,
    xpDelta: number,
    reason: string
  ): Promise<{
    status: 'SUCCESS' | 'ALREADY_PROCESSED';
    xpAwarded: number;
    avatar: AvatarDto;
  }> {
    try {
      return await prisma.$transaction(async (tx) => {
        // Attempt to insert XPTransaction with unique resultId
        await tx.xPTransaction.create({
          data: {
            userId,
            resultId,
            xpDelta,
            reason,
          },
        });

        // If insert succeeded, update avatar
        const currentAvatar = await tx.avatar.findUnique({
          where: { userId },
        });

        if (!currentAvatar) {
          throw new Error('Không tìm thấy avatar của người dùng');
        }

        const newXpTotal = currentAvatar.xpTotal + xpDelta;
        const newLevel = calculateLevel(newXpTotal);

        const updatedAvatar = await tx.avatar.update({
          where: { userId },
          data: {
            xpTotal: newXpTotal,
            level: newLevel,
          },
        });

        return {
          status: 'SUCCESS' as const,
          xpAwarded: xpDelta,
          avatar: {
            id: updatedAvatar.id,
            userId: updatedAvatar.userId,
            color: updatedAvatar.color as any,
            hat: updatedAvatar.hat as any,
            glasses: updatedAvatar.glasses as any,
            accessory: updatedAvatar.accessory,
            xpTotal: updatedAvatar.xpTotal,
            level: updatedAvatar.level,
          },
        };
      });
    } catch (error: any) {
      // Prisma P2002 error code is Unique constraint failed
      if (error.code === 'P2002' || error.message?.includes('Unique constraint')) {
        const existingAvatar = await prisma.avatar.findUnique({
          where: { userId },
        });

        return {
          status: 'ALREADY_PROCESSED' as const,
          xpAwarded: 0,
          avatar: existingAvatar
            ? {
                id: existingAvatar.id,
                userId: existingAvatar.userId,
                color: existingAvatar.color as any,
                hat: existingAvatar.hat as any,
                glasses: existingAvatar.glasses as any,
                accessory: existingAvatar.accessory,
                xpTotal: existingAvatar.xpTotal,
                level: existingAvatar.level,
              }
            : ({} as any),
        };
      }
      throw error;
    }
  }
}

export const avatarService = new AvatarService();
