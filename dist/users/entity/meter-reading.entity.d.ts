import { ReadingSource } from '../../common/enums/reading-source.enum';
import { ReadingStatus } from '../../common/enums/reading-status.enum';
import { MeterEntity } from './meter.entity';
import { UserEntity } from './user.entity';
export declare class MeterReadingEntity {
    id: string;
    meterId: string;
    meter: MeterEntity;
    userId: string;
    user: UserEntity;
    readingValue: number;
    readingDate: Date;
    source: ReadingSource;
    status: ReadingStatus;
    imageUrl?: string | null;
    createdAt: Date;
    updatedAt: Date;
}
