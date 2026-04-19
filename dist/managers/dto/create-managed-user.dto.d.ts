import { UserRole } from '../../common/enums/user-role.enum';
export declare class CreateManagedUserDto {
    fullName: string;
    email: string;
    phone?: string;
    username: string;
    role: UserRole;
    zoneId?: string;
    zoneName?: string;
}
