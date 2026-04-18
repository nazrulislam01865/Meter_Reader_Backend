import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { numericTransformer } from '../../common/database/numeric.transformer';
import { BillStatus } from '../../common/enums/bill-status.enum';
import { UserEntity } from './user.entity';
import { PaymentEntity } from './payment.entity';


@Entity({ name: 'bills' })
export class BillEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => UserEntity, (user) => user.bills, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @Column({ type: 'int' })
  billingYear!: number;

  @Column({ type: 'int' })
  billingMonth!: number;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    transformer: numericTransformer,
  })
  unitsConsumed!: number;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    transformer: numericTransformer,
  })
  unitPrice!: number;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    transformer: numericTransformer,
  })
  subtotal!: number;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: numericTransformer,
  })
  surcharge!: number;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: numericTransformer,
  })
  totalAmount!: number;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: numericTransformer,
  })
  paidAmount!: number;

  @Column({ type: 'date' })
  dueDate!: string;

  @Column({ type: 'timestamp', nullable: true })
  paidAt?: Date | null;

  @Column({
    type: 'enum',
    enum: BillStatus,
    default: BillStatus.GENERATED,
  })
  status!: BillStatus;

  @OneToMany(() => PaymentEntity, (payment) => payment.bill)
  payments?: PaymentEntity[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}