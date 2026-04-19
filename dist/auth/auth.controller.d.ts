import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import type { AuthenticatedUser } from './interfaces/authenticated-user.interface';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(dto: LoginDto): Promise<import("./dto/auth-response.dto").AuthResponseDto>;
    refresh(dto: RefreshTokenDto): Promise<import("./dto/auth-response.dto").AuthResponseDto>;
    logout(user: AuthenticatedUser): Promise<{
        message: string;
    }>;
    me(user: AuthenticatedUser): Promise<import("../users/entity/user.entity").UserEntity>;
}
