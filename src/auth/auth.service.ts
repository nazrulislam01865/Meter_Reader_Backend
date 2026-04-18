import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { UserEntity } from '../users/entity/user.entity';
import { UserStatus } from '../common/enums/user-status.enum';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect(['user.password', 'user.refreshTokenHash'])
      .where('LOWER(user.username) = LOWER(:username)', {
        username: dto.username,
      })
      .andWhere('user.deletedAt IS NULL')
      .getOne();

    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('This account is not active');
    }

    const passwordMatched = await bcrypt.compare(dto.password, user.password);

    if (!passwordMatched) {
      throw new UnauthorizedException('Invalid username or password');
    }

    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    return this.issueTokens(user);
  }

  async refreshTokens(
    userId: string,
    refreshToken: string,
  ): Promise<AuthResponseDto> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect(['user.password', 'user.refreshTokenHash'])
      .where('user.id = :userId', { userId })
      .andWhere('user.deletedAt IS NULL')
      .getOne();

    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokenMatched = await bcrypt.compare(refreshToken, user.refreshTokenHash);

    if (!tokenMatched) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return this.issueTokens(user);
  }

  async logout(userId: string): Promise<{ message: string }> {
    await this.userRepository.update(userId, {
      refreshTokenHash: null,
    });

    return { message: 'Logged out successfully' };
  }

  async getMe(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        username: true,
        email: true,
        phone: true,
        zoneId: true,
        zoneName: true,
        role: true,
        status: true,
        passwordResetRequired: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  async hashPassword(rawPassword: string): Promise<string> {
    return bcrypt.hash(rawPassword, 12);
  }

  generateTemporaryPassword(length = 10): string {
    const chars =
      'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#';
    let password = '';

    for (let i = 0; i < length; i += 1) {
      password += chars[Math.floor(Math.random() * chars.length)];
    }

    return password;
  }

  private async issueTokens(user: UserEntity): Promise<AuthResponseDto> {
    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
      status: user.status,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>(
        'JWT_ACCESS_SECRET',
        'dev-access-secret',
      ),
      expiresIn: 15 * 60, // 15 minutes in seconds
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>(
        'JWT_REFRESH_SECRET',
        'dev-refresh-secret',
      ),
      expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
    });

    const refreshTokenHash = await bcrypt.hash(refreshToken, 12);

    await this.userRepository.update(user.id, {
      refreshTokenHash,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        role: user.role,
        zoneName: user.zoneName ?? null,
        passwordResetRequired: user.passwordResetRequired,
      },
    };
  }
}