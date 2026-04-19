import { UserRole } from '../../common/enums/user-role.enum';
import { UserStatus } from '../../common/enums/user-status.enum';
export declare class UpdateManagedUserDto {
    fullName?: string;
    email?: string;
    phone?: string;
    username?: string;
    role?: UserRole;
    status?: UserStatus;
    zoneId?: string;
    zoneName?: string;
}
