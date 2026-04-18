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
exports.MeterReadingEntity = void 0;
const typeorm_1 = require("typeorm");
const numeric_transformer_1 = require("../../common/database/numeric.transformer");
const reading_source_enum_1 = require("../../common/enums/reading-source.enum");
const reading_status_enum_1 = require("../../common/enums/reading-status.enum");
const meter_entity_1 = require("./meter.entity");
const user_entity_1 = require("./user.entity");
let MeterReadingEntity = class MeterReadingEntity {
    id;
    meterId;
    meter;
    userId;
    user;
    readingValue;
    readingDate;
    source;
    status;
    imageUrl;
    createdAt;
    updatedAt;
};
exports.MeterReadingEntity = MeterReadingEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], MeterReadingEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'meter_id', type: 'uuid' }),
    __metadata("design:type", String)
], MeterReadingEntity.prototype, "meterId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => meter_entity_1.MeterEntity, (meter) => meter.readings, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'meter_id' }),
    __metadata("design:type", meter_entity_1.MeterEntity)
], MeterReadingEntity.prototype, "meter", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', type: 'uuid' }),
    __metadata("design:type", String)
], MeterReadingEntity.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.UserEntity, (user) => user.readings, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.UserEntity)
], MeterReadingEntity.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'numeric',
        precision: 12,
        scale: 2,
        transformer: numeric_transformer_1.numericTransformer,
    }),
    __metadata("design:type", Number)
], MeterReadingEntity.prototype, "readingValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], MeterReadingEntity.prototype, "readingDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: reading_source_enum_1.ReadingSource,
        default: reading_source_enum_1.ReadingSource.MANUAL,
    }),
    __metadata("design:type", String)
], MeterReadingEntity.prototype, "source", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: reading_status_enum_1.ReadingStatus,
        default: reading_status_enum_1.ReadingStatus.PENDING,
    }),
    __metadata("design:type", String)
], MeterReadingEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", Object)
], MeterReadingEntity.prototype, "imageUrl", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], MeterReadingEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], MeterReadingEntity.prototype, "updatedAt", void 0);
exports.MeterReadingEntity = MeterReadingEntity = __decorate([
    (0, typeorm_1.Entity)({ name: 'meter_readings' })
], MeterReadingEntity);
//# sourceMappingURL=meter-reading.entity.js.map