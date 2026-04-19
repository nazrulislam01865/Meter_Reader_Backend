import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { UserRole } from '../common/enums/user-role.enum';
import { ManagerService } from './manager.service';
import { CreateManagedUserDto } from './dto/create-managed-user.dto';
import { CreateManualReadingDto } from './dto/create-manual-reading.dto';
import { ManagerUsersQueryDto } from './dto/manager-users-query.dto';
import { ReadingsQueryDto } from './dto/readings-query.dto';
import { UpdateManagedUserDto } from './dto/update-managed-user.dto';
import { UpdateUnitPriceDto } from './dto/update-unit-price.dto';
export declare class ManagerController {
    private readonly managerService;
    constructor(managerService: ManagerService);
    getDashboardSummary(): Promise<{
        summary: {
            currentMonth: string;
            previousMonth: string;
            totalMeters: number;
            unitPrice: number;
        };
    }>;
    createManagedUser(actor: AuthenticatedUser, dto: CreateManagedUserDto): Promise<{
        message: string;
        data: {
            id: string;
            fullName: string;
            email: string;
            username: string;
            role: UserRole;
            zoneName: string | null;
            status: import("../common/enums/user-status.enum").UserStatus;
            temporaryPassword: string;
        };
    }>;
    listManagedUsers(query: ManagerUsersQueryDto): Promise<{
        data: {
            id: string;
            fullName: string;
            email: string;
            phone: string | null;
            username: string;
            role: UserRole;
            status: import("../common/enums/user-status.enum").UserStatus;
            zoneId: string | null;
            zoneName: string | null;
            createdAt: Date;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getManagedUser(id: string): Promise<{
        data: {
            id: string;
            fullName: string;
            email: string;
            phone: string | null;
            username: string;
            role: UserRole;
            status: import("../common/enums/user-status.enum").UserStatus;
            zoneId: string | null;
            zoneName: string | null;
            createdAt: Date;
        };
    }>;
    updateManagedUser(actor: AuthenticatedUser, id: string, dto: UpdateManagedUserDto): Promise<{
        message: string;
        data: {
            id: string;
            fullName: string;
            email: string;
            phone: string | null;
            username: string;
            role: UserRole;
            status: import("../common/enums/user-status.enum").UserStatus;
            zoneId: string | null;
            zoneName: string | null;
        };
    }>;
    deleteManagedUser(actor: AuthenticatedUser, id: string): Promise<{
        message: string;
        data: {
            id: string;
            fullName: string;
        };
    }>;
    submitManualReading(actor: AuthenticatedUser, dto: CreateManualReadingDto): Promise<{
        message: string;
        data: {
            readingId: string;
            meterNumber: string;
            customerId: string;
            customerName: string;
            zoneName: string | null;
            previousReading: number;
            currentReading: number;
            usageKwh: number;
            billId: string;
            billAmount: number;
            unitPrice: number;
            status: string;
        };
    }>;
    getAllReadings(query: ReadingsQueryDto): Promise<{
        data: {
            id: string;
            meterId: string;
            customer: string;
            zone: string | null;
            value: number;
            unit: string;
            date: string;
            status: string;
            currentReading: number;
            previousReading: number | null;
            notes: string | null;
            enteredBy: string | null;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getCurrentUnitPrice(): Promise<{
        data: {
            unitPrice: number;
            effectiveFrom: Date | null;
        };
    }>;
    updateUnitPrice(dto: UpdateUnitPriceDto): Promise<{
        message: string;
        data: {
            id: string;
            unitPrice: number;
            effectiveFrom: Date;
        };
    }>;
}
