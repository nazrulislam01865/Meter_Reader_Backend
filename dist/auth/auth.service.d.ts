import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { UserEntity } from '../users/entity/user.entity';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
export declare class AuthService {
    private readonly userRepository;
    private readonly jwtService;
    private readonly configService;
    constructor(userRepository: Repository<UserEntity>, jwtService: JwtService, configService: ConfigService);
    login(dto: LoginDto): Promise<AuthResponseDto>;
    refresh(refreshToken: string): Promise<AuthResponseDto>;
    logout(userId: string): Promise<{
        message: string;
    }>;
    me(userId: string): Promise<UserEntity>;
    hashPassword(rawPassword: string): Promise<string>;
    generateTemporaryPassword(length?: number): string;
    private issueTokens;
    private getAccessTokenExpiry;
    private getRefreshTokenExpiry;
}
