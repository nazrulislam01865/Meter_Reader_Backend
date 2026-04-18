import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

import { numericTransformer } from '../../common/database/numeric.transformer';
import { MeterReadingEntity } from './meter-reading.entity';

@Entity({ name: 'meters' })
export class MeterEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 40, unique: true })
  meterNumber!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  qrCode?: string | null;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    default: 200,
    transformer: numericTransformer,
  })
  monthlyUsageTargetKwh!: number;

  @OneToOne(() => UserEntity, (user) => user.meter, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId!: string;

  @OneToMany(() => MeterReadingEntity, (reading) => reading.meter)
  readings?: MeterReadingEntity[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}