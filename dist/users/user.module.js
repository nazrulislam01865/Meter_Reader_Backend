"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_module_1 = require("@nestjs/typeorm/dist/typeorm.module");
const user_entity_1 = require("./entity/user.entity");
const meter_entity_1 = require("./entity/meter.entity");
const bill_entity_1 = require("./entity/bill.entity");
const payment_entity_1 = require("./entity/payment.entity");
const billing_setting_entity_1 = require("./entity/billing-setting.entity");
const meter_reading_entity_1 = require("./entity/meter-reading.entity");
const user_controller_1 = require("./user.controller");
const user_service_1 = require("./user.service");
let UsersModule = class UsersModule {
};
exports.UsersModule = UsersModule;
exports.UsersModule = UsersModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_module_1.TypeOrmModule.forFeature([
                user_entity_1.UserEntity,
                meter_entity_1.MeterEntity,
                bill_entity_1.BillEntity,
                payment_entity_1.PaymentEntity,
                billing_setting_entity_1.BillingSettingEntity,
                meter_reading_entity_1.MeterReadingEntity,
            ]),
        ],
        controllers: [user_controller_1.UserController],
        providers: [user_service_1.UserService],
        exports: [user_service_1.UserService],
    })
], UsersModule);
//# sourceMappingURL=user.module.js.map