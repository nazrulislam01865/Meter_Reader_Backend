"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const jwt_1 = require("@nestjs/jwt");
const typeorm_2 = require("typeorm");
const bcrypt = __importStar(require("bcrypt"));
const config_1 = require("@nestjs/config");
const user_entity_1 = require("../users/entity/user.entity");
const user_status_enum_1 = require("../common/enums/user-status.enum");
let AuthService = class AuthService {
    userRepository;
    jwtService;
    configService;
    constructor(userRepository, jwtService, configService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async login(dto) {
        const user = await this.userRepository
            .createQueryBuilder('user')
            .addSelect(['user.password', 'user.refreshTokenHash'])
            .where('LOWER(user.username) = LOWER(:username)', {
            username: dto.username.trim(),
        })
            .andWhere('user.deletedAt IS NULL')
            .getOne();
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid username or password');
        }
        if (user.status !== user_status_enum_1.UserStatus.ACTIVE) {
            throw new common_1.UnauthorizedException('This account is not active');
        }
        const matched = await bcrypt.compare(dto.password, user.password);
        if (!matched) {
            throw new common_1.UnauthorizedException('Invalid username or password');
        }
        user.lastLoginAt = new Date();
        await this.userRepository.save(user);
        return this.issueTokens(user);
    }
    async refresh(refreshToken) {
        let payload;
        try {
            payload = await this.jwtService.verifyAsync(refreshToken, {
                secret: this.configService.get('JWT_REFRESH_SECRET', 'dev-refresh-secret'),
            });
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        const user = await this.userRepository
            .createQueryBuilder('user')
            .addSelect(['user.password', 'user.refreshTokenHash'])
            .where('user.id = :id', { id: payload.sub })
            .andWhere('user.deletedAt IS NULL')
            .getOne();
        if (!user || !user.refreshTokenHash) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        const matched = await bcrypt.compare(refreshToken, user.refreshTokenHash);
        if (!matched) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        if (user.status !== user_status_enum_1.UserStatus.ACTIVE) {
            throw new common_1.UnauthorizedException('This account is not active');
        }
        return this.issueTokens(user);
    }
    async logout(userId) {
        await this.userRepository.update(userId, {
            refreshTokenHash: null,
        });
        return {
            message: 'Logged out successfully',
        };
    }
    async me(userId) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            select: {
                id: true,
                fullName: true,
                username: true,
                email: true,
                phone: true,
                role: true,
                status: true,
                zoneId: true,
                zoneName: true,
                passwordResetRequired: true,
                lastLoginAt: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        return user;
    }
    async hashPassword(rawPassword) {
        return bcrypt.hash(rawPassword, 12);
    }
    generateTemporaryPassword(length = 10) {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#';
        let password = '';
        for (let i = 0; i < length; i += 1) {
            password += chars[Math.floor(Math.random() * chars.length)];
        }
        return password;
    }
    async issueTokens(user) {
        const payload = {
            sub: user.id,
            username: user.username,
            role: user.role,
            status: user.status,
        };
        const accessToken = await this.jwtService.signAsync(payload, {
            secret: this.configService.get('JWT_ACCESS_SECRET', 'dev-access-secret'),
            expiresIn: this.getAccessTokenExpiry(),
        });
        const refreshToken = await this.jwtService.signAsync(payload, {
            secret: this.configService.get('JWT_REFRESH_SECRET', 'dev-refresh-secret'),
            expiresIn: this.getRefreshTokenExpiry(),
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
                status: user.status,
                zoneName: user.zoneName ?? null,
                passwordResetRequired: user.passwordResetRequired,
            },
        };
    }
    getAccessTokenExpiry() {
        return (this.configService.get('JWT_ACCESS_EXPIRES_IN') ??
            '15m');
    }
    getRefreshTokenExpiry() {
        return (this.configService.get('JWT_REFRESH_EXPIRES_IN') ??
            '7d');
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map