import { DataSource, Repository } from 'typeorm';
import { AuthService } from '../auth/auth.service';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { UserRole } from '../common/enums/user-role.enum';
import { UserStatus } from '../common/enums/user-status.enum';
import { BillEntity } from '../users/entity/bill.entity';
import { BillingSettingEntity } from '../users/entity/billing-setting.entity';
import { MeterEntity } from '../users/entity/meter.entity';
import { MeterReadingEntity } from '../users/entity/meter-reading.entity';
import { UserEntity } from '../users/entity/user.entity';
import { CreateManagedUserDto } from './dto/create-managed-user.dto';
import { CreateManualReadingDto } from './dto/create-manual-reading.dto';
import { ManagerUsersQueryDto } from './dto/manager-users-query.dto';
import { ReadingsQueryDto } from './dto/readings-query.dto';
import { UpdateManagedUserDto } from './dto/update-managed-user.dto';
import { UpdateUnitPriceDto } from './dto/update-unit-price.dto';
export declare class ManagerService {
    private readonly dataSource;
    private readonly authService;
    private readonly userRepository;
    private readonly meterRepository;
    private readonly readingRepository;
    private readonly billingSettingRepository;
    private readonly billRepository;
    constructor(dataSource: DataSource, authService: AuthService, userRepository: Repository<UserEntity>, meterRepository: Repository<MeterEntity>, readingRepository: Repository<MeterReadingEntity>, billingSettingRepository: Repository<BillingSettingEntity>, billRepository: Repository<BillEntity>);
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
            status: UserStatus;
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
            status: UserStatus;
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
    getManagedUserById(id: string): Promise<{
        data: {
            id: string;
            fullName: string;
            email: string;
            phone: string | null;
            username: string;
            role: UserRole;
            status: UserStatus;
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
            status: UserStatus;
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
    private assertCanAssignRole;
    private assertCanChangeExistingUser;
    private buildDueDate;
    private getMonthLabel;
    private getShortMonthLabel;
    private formatReadingDate;
    private mapReadingStatusToUi;
    private roundToTwo;
}
