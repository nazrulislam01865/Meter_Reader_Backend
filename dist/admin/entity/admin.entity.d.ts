import { UserRole } from "../../common/enums/user-role.enum";
import { UserStatus } from "../../common/enums/user-status.enum";
export declare class AdminEntity {
    id: number;
    fullName: string;
    email: string;
    phone?: string | null;
    username: string;
    password: string;
    role: UserRole;
    status: UserStatus;
    createdAt: Date;
    updatedAt: Date;
}
