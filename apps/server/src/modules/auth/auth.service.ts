import bcrypt from 'bcryptjs';
import { prisma } from '@repo/database';
import { RegisterDto, LoginDto, UserProfileDto, calculateLevel } from '@repo/shared-types';

export class AuthService {
  async register(data: RegisterDto): Promise<{ user: UserProfileDto; tokenPayload: { id: string; email: string; nickname: string } }> {
    // Check existing email
    const existingEmail = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingEmail) {
      throw new Error('Email đã được sử dụng');
    }

    // Check existing nickname
    const existingNickname = await prisma.user.findUnique({
      where: { nickname: data.nickname },
    });
    if (existingNickname) {
      throw new Error('Biệt danh đã có người sử dụng');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    // Create user and default avatar in a transaction
    const user = await prisma.user.create({
      data: {
        email: data.email,
        nickname: data.nickname,
        passwordHash,
        avatar: {
          create: {
            color: 'retro-yellow',
            hat: 'none',
            glasses: 'none',
            accessory: 'none',
            xpTotal: 0,
            level: 1,
            coins: 50, // Welcome gift
          },
        },
      },
      include: {
        avatar: true,
      },
    });

    if (!user.avatar) {
      throw new Error('Lỗi tạo avatar mặc định');
    }

    const userProfile: UserProfileDto = {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
      avatar: {
        id: user.avatar.id,
        userId: user.avatar.userId,
        color: user.avatar.color as any,
        hat: user.avatar.hat as any,
        glasses: user.avatar.glasses as any,
        accessory: user.avatar.accessory,
        xpTotal: user.avatar.xpTotal,
        level: user.avatar.level,
      },
      personalBestSoloMs: null,
    };

    return {
      user: userProfile,
      tokenPayload: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
      },
    };
  }

  async login(data: LoginDto): Promise<{ user: UserProfileDto; tokenPayload: { id: string; email: string; nickname: string } }> {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: {
        avatar: true,
        personalBests: {
          where: { gameType: 'NUMBER_HUNT', mode: 'SOLO' },
          take: 1,
        },
      },
    });

    if (!user) {
      throw new Error('Email hoặc mật khẩu không chính xác');
    }

    const isValidPassword = await bcrypt.compare(data.password, user.passwordHash);
    if (!isValidPassword) {
      throw new Error('Email hoặc mật khẩu không chính xác');
    }

    // Ensure avatar exists
    let avatar = user.avatar;
    if (!avatar) {
      avatar = await prisma.avatar.create({
        data: {
          userId: user.id,
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

    const pb = user.personalBests[0];

    const userProfile: UserProfileDto = {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
      avatar: {
        id: avatar.id,
        userId: avatar.userId,
        color: avatar.color as any,
        hat: avatar.hat as any,
        glasses: avatar.glasses as any,
        accessory: avatar.accessory,
        xpTotal: avatar.xpTotal,
        level: avatar.level,
      },
      personalBestSoloMs: pb ? pb.bestValueMs : null,
    };

    return {
      user: userProfile,
      tokenPayload: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
      },
    };
  }

  async getMe(userId: string): Promise<UserProfileDto> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        avatar: true,
        personalBests: {
          where: { gameType: 'NUMBER_HUNT', mode: 'SOLO' },
          take: 1,
        },
      },
    });

    if (!user) {
      throw new Error('Không tìm thấy người dùng');
    }

    let avatar = user.avatar;
    if (!avatar) {
      avatar = await prisma.avatar.create({
        data: {
          userId: user.id,
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

    const pb = user.personalBests[0];

    return {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
      avatar: {
        id: avatar.id,
        userId: avatar.userId,
        color: avatar.color as any,
        hat: avatar.hat as any,
        glasses: avatar.glasses as any,
        accessory: avatar.accessory,
        xpTotal: avatar.xpTotal,
        level: avatar.level,
      },
      personalBestSoloMs: pb ? pb.bestValueMs : null,
    };
  }
}

export const authService = new AuthService();

