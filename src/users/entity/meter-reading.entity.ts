import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { numericTransformer } from '../../common/database/numeric.transformer';
import { ReadingSource } from '../../common/enums/reading-source.enum';
import { ReadingStatus } from '../../common/enums/reading-status.enum';
import { MeterEntity } from './meter.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'meter_readings' })
export class MeterReadingEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'meter_id', type: 'uuid' })
  meterId!: string;

  @ManyToOne(() => MeterEntity, (meter) => meter.readings, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'meter_id' })
  meter!: MeterEntity;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => UserEntity, (user) => user.readings, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @Column({ name: 'entered_by_user_id', type: 'uuid', nullable: true })
  enteredByUserId?: string | null;

  @ManyToOne(() => UserEntity, (user) => user.enteredReadings, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'entered_by_user_id' })
  enteredBy?: UserEntity | null;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    transformer: numericTransformer,
  })
  readingValue!: number;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    nullable: true,
    transformer: numericTransformer,
  })
  previousReadingValue?: number | null;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    nullable: true,
    transformer: numericTransformer,
  })
  usageKwh?: number | null;

  @Column({ type: 'timestamp' })
  readingDate!: Date;

  @Column({
    type: 'enum',
    enum: ReadingSource,
    default: ReadingSource.MANUAL,
  })
  source!: ReadingSource;

  @Column({
    type: 'enum',
    enum: ReadingStatus,
    default: ReadingStatus.PENDING,
  })
  status!: ReadingStatus;

  @Column({ type: 'varchar', length: 500, nullable: true })
  notes?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  imageUrl?: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}