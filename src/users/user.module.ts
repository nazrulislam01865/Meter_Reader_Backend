import { Injectable, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm/dist/typeorm.module";
import { UserEntity } from "./entity/user.entity";
import { MeterEntity } from "./entity/meter.entity";
import { BillEntity } from "./entity/bill.entity";
import { PaymentEntity } from "./entity/payment.entity";
import { BillingSettingEntity } from "./entity/billing-setting.entity";
import { MeterReadingEntity } from "./entity/meter-reading.entity";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";


@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      MeterEntity,
      BillEntity,
      PaymentEntity,
      BillingSettingEntity,
      MeterReadingEntity,
    ]),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UsersModule {}