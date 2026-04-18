import { UserRole } from '../../common/enums/user-role.enum';
import { UserStatus } from '../../common/enums/user-status.enum';
export declare class CreateAdminDto {
    fullName: string;
    email: string;
    phone?: string;
    username: string;
    password: string;
    role?: UserRole;
    status?: UserStatus;
}
export declare class UpdateAdminDto {
    fullName?: string;
    email?: string;
    phone?: string;
    username?: string;
    password?: string;
    role?: UserRole;
    status?: UserStatus;
}
export declare class UpdateAdminStatusDto {
    status: UserStatus;
}
