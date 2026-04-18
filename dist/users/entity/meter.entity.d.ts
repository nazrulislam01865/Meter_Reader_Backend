import { UserEntity } from './user.entity';
import { MeterReadingEntity } from './meter-reading.entity';
export declare class MeterEntity {
    id: string;
    meterNumber: string;
    qrCode?: string | null;
    isActive: boolean;
    monthlyUsageTargetKwh: number;
    user: UserEntity;
    userId: string;
    readings?: MeterReadingEntity[];
    createdAt: Date;
    updatedAt: Date;
}
