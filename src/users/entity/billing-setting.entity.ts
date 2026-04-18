import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { numericTransformer } from '../../common/database/numeric.transformer';

@Entity({ name: 'billing_settings' })
export class BillingSettingEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    transformer: numericTransformer,
  })
  unitPrice!: number;

  @Column({ type: 'timestamp' })
  effectiveFrom!: Date;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}