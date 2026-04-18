import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRole } from '../../common/enums/user-role.enum';
import { UserStatus } from '../../common/enums/user-status.enum';
import { MeterEntity } from './meter.entity';
import { BillEntity } from './bill.entity';
import { PaymentEntity } from './payment.entity';
import { MeterReadingEntity } from './meter-reading.entity';

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 120 })
  fullName!: string;

  @Column({ type: 'varchar', length: 120, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string | null;

  @Column({ type: 'varchar', length: 50, unique: true })
  username!: string;

  @Column({ type: 'varchar', length: 255, select: false })
  password!: string;

  @Column({ type: 'varchar', length: 255, nullable: true, select: false })
  refreshTokenHash?: string | null;

  @Column({ type: 'boolean', default: true })
  passwordResetRequired!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt?: Date | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  zoneId?: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  zoneName?: string | null;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CUSTOMER,
  })
  role!: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status!: UserStatus;

  @OneToOne(() => MeterEntity, (meter) => meter.user)
  meter?: MeterEntity;

  @OneToMany(() => BillEntity, (bill) => bill.user)
  bills?: BillEntity[];

  @OneToMany(() => PaymentEntity, (payment) => payment.user)
  payments?: PaymentEntity[];

  @OneToMany(() => MeterReadingEntity, (reading) => reading.user)
  readings?: MeterReadingEntity[];

  @OneToMany(() => MeterReadingEntity, (reading) => reading.enteredBy)
  enteredReadings?: MeterReadingEntity[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date | null;
}