"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserEntity = void 0;
const typeorm_1 = require("typeorm");
const user_role_enum_1 = require("../../common/enums/user-role.enum");
const user_status_enum_1 = require("../../common/enums/user-status.enum");
const meter_entity_1 = require("./meter.entity");
const bill_entity_1 = require("./bill.entity");
const payment_entity_1 = require("./payment.entity");
const meter_reading_entity_1 = require("./meter-reading.entity");
let UserEntity = class UserEntity {
    id;
    fullName;
    email;
    phone;
    username;
    password;
    zoneId;
    zoneName;
    role;
    status;
    meter;
    bills;
    payments;
    readings;
    createdAt;
    updatedAt;
};
exports.UserEntity = UserEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], UserEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 120 }),
    __metadata("design:type", String)
], UserEntity.prototype, "fullName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 120, unique: true }),
    __metadata("design:type", String)
], UserEntity.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, nullable: true }),
    __metadata("design:type", Object)
], UserEntity.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, unique: true }),
    __metadata("design:type", String)
], UserEntity.prototype, "username", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], UserEntity.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", Object)
], UserEntity.prototype, "zoneId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", Object)
], UserEntity.prototype, "zoneName", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: user_role_enum_1.UserRole,
        default: user_role_enum_1.UserRole.CUSTOMER,
    }),
    __metadata("design:type", String)
], UserEntity.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: user_status_enum_1.UserStatus,
        default: user_status_enum_1.UserStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], UserEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => meter_entity_1.MeterEntity, (meter) => meter.user),
    __metadata("design:type", meter_entity_1.MeterEntity)
], UserEntity.prototype, "meter", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => bill_entity_1.BillEntity, (bill) => bill.user),
    __metadata("design:type", Array)
], UserEntity.prototype, "bills", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => payment_entity_1.PaymentEntity, (payment) => payment.user),
    __metadata("design:type", Array)
], UserEntity.prototype, "payments", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => meter_reading_entity_1.MeterReadingEntity, (reading) => reading.user),
    __metadata("design:type", Array)
], UserEntity.prototype, "readings", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], UserEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], UserEntity.prototype, "updatedAt", void 0);
exports.UserEntity = UserEntity = __decorate([
    (0, typeorm_1.Entity)({ name: 'users' })
], UserEntity);
//# sourceMappingURL=user.entity.js.map