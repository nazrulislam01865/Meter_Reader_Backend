import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { BillEntity } from '../users/entity/bill.entity';
import { BillingSettingEntity } from '../users/entity/billing-setting.entity';
import { MeterEntity } from '../users/entity/meter.entity';
import { MeterReadingEntity } from '../users/entity/meter-reading.entity';
import { UserEntity } from '../users/entity/user.entity';
import { ManagerController } from './manager.controller';
import { ManagerService } from './manager.service';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      UserEntity,
      MeterEntity,
      MeterReadingEntity,
      BillingSettingEntity,
      BillEntity,
    ]),
  ],
  controllers: [ManagerController],
  providers: [ManagerService],
  exports: [ManagerService],
})
export class ManagerModule {}