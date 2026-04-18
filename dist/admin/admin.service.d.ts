import { AdminEntity } from "./entity/admin.entity";
import { Repository } from "typeorm";
import { CreateAdminDto } from "./dto/admin.dto";
export declare class AdminService {
    private readonly adminRepository;
    constructor(adminRepository: Repository<AdminEntity>);
    createAdmin(data: CreateAdminDto): Promise<{
        message: string;
        data: {
            id: number;
            username: string;
            name: string;
            email: string;
            createdAt: Date;
            phone: string | null | undefined;
            status: import("../common/enums/user-status.enum").UserStatus;
        };
    }>;
    private hasahPassword;
    private ensureUniqueFields;
    getAdmin(id: number): Promise<{
        message: string;
        data: {
            id: number;
            username: string;
            name: string;
            email: string;
            status: import("../common/enums/user-status.enum").UserStatus;
        };
    }>;
}
