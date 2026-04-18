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
exports.MeterEntity = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const numeric_transformer_1 = require("../../common/database/numeric.transformer");
const meter_reading_entity_1 = require("./meter-reading.entity");
let MeterEntity = class MeterEntity {
    id;
    meterNumber;
    qrCode;
    isActive;
    monthlyUsageTargetKwh;
    user;
    userId;
    readings;
    createdAt;
    updatedAt;
};
exports.MeterEntity = MeterEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], MeterEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 40, unique: true }),
    __metadata("design:type", String)
], MeterEntity.prototype, "meterNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", Object)
], MeterEntity.prototype, "qrCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], MeterEntity.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'numeric',
        precision: 10,
        scale: 2,
        default: 200,
        transformer: numeric_transformer_1.numericTransformer,
    }),
    __metadata("design:type", Number)
], MeterEntity.prototype, "monthlyUsageTargetKwh", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => user_entity_1.UserEntity, (user) => user.meter, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.UserEntity)
], MeterEntity.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', type: 'uuid', unique: true }),
    __metadata("design:type", String)
], MeterEntity.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => meter_reading_entity_1.MeterReadingEntity, (reading) => reading.meter),
    __metadata("design:type", Array)
], MeterEntity.prototype, "readings", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], MeterEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], MeterEntity.prototype, "updatedAt", void 0);
exports.MeterEntity = MeterEntity = __decorate([
    (0, typeorm_1.Entity)({ name: 'meters' })
], MeterEntity);
//# sourceMappingURL=meter.entity.js.map