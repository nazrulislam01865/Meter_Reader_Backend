import { UserRole } from '../../common/enums/user-role.enum';
import { UserStatus } from '../../common/enums/user-status.enum';
import { MeterEntity } from './meter.entity';
import { BillEntity } from './bill.entity';
import { PaymentEntity } from './payment.entity';
import { MeterReadingEntity } from './meter-reading.entity';
export declare class UserEntity {
    id: string;
    fullName: string;
    email: string;
    phone?: string | null;
    username: string;
    password: string;
    refreshTokenHash?: string | null;
    passwordResetRequired: boolean;
    lastLoginAt?: Date | null;
    zoneId?: string | null;
    zoneName?: string | null;
    role: UserRole;
    status: UserStatus;
    meter?: MeterEntity;
    bills?: BillEntity[];
    payments?: PaymentEntity[];
    readings?: MeterReadingEntity[];
    enteredReadings?: MeterReadingEntity[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
}
