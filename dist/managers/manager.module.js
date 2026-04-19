"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManagerModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const auth_module_1 = require("../auth/auth.module");
const bill_entity_1 = require("../users/entity/bill.entity");
const billing_setting_entity_1 = require("../users/entity/billing-setting.entity");
const meter_entity_1 = require("../users/entity/meter.entity");
const meter_reading_entity_1 = require("../users/entity/meter-reading.entity");
const user_entity_1 = require("../users/entity/user.entity");
const manager_controller_1 = require("./manager.controller");
const manager_service_1 = require("./manager.service");
let ManagerModule = class ManagerModule {
};
exports.ManagerModule = ManagerModule;
exports.ManagerModule = ManagerModule = __decorate([
    (0, common_1.Module)({
        imports: [
            auth_module_1.AuthModule,
            typeorm_1.TypeOrmModule.forFeature([
                user_entity_1.UserEntity,
                meter_entity_1.MeterEntity,
                meter_reading_entity_1.MeterReadingEntity,
                billing_setting_entity_1.BillingSettingEntity,
                bill_entity_1.BillEntity,
            ]),
        ],
        controllers: [manager_controller_1.ManagerController],
        providers: [manager_service_1.ManagerService],
        exports: [manager_service_1.ManagerService],
    })
], ManagerModule);
//# sourceMappingURL=manager.module.js.map