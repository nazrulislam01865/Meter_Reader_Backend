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
import { PaymentMethod } from '../../common/enums/payment-method.enum';
import { PaymentStatus } from '../../common/enums/payment-status.enum';
import { BillEntity } from './bill.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'payments' })
export class PaymentEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'bill_id', type: 'uuid' })
  billId!: string;

  @ManyToOne(() => BillEntity, (bill) => bill.payments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'bill_id' })
  bill!: BillEntity;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => UserEntity, (user) => user.payments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    transformer: numericTransformer,
  })
  amount!: number;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
  })
  method!: PaymentMethod;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.SUCCESS,
  })
  status!: PaymentStatus;

  @Column({ type: 'varchar', length: 120, nullable: true })
  transactionReference?: string | null;

  @Column({ type: 'timestamp' })
  paidAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}