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
exports.BillEntity = void 0;
const typeorm_1 = require("typeorm");
const numeric_transformer_1 = require("../../common/database/numeric.transformer");
const bill_status_enum_1 = require("../../common/enums/bill-status.enum");
const user_entity_1 = require("./user.entity");
const payment_entity_1 = require("./payment.entity");
let BillEntity = class BillEntity {
    id;
    userId;
    user;
    billingYear;
    billingMonth;
    unitsConsumed;
    unitPrice;
    subtotal;
    surcharge;
    totalAmount;
    paidAmount;
    dueDate;
    paidAt;
    status;
    payments;
    createdAt;
    updatedAt;
};
exports.BillEntity = BillEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], BillEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', type: 'uuid' }),
    __metadata("design:type", String)
], BillEntity.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.UserEntity, (user) => user.bills, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.UserEntity)
], BillEntity.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], BillEntity.prototype, "billingYear", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], BillEntity.prototype, "billingMonth", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'numeric',
        precision: 12,
        scale: 2,
        transformer: numeric_transformer_1.numericTransformer,
    }),
    __metadata("design:type", Number)
], BillEntity.prototype, "unitsConsumed", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'numeric',
        precision: 10,
        scale: 2,
        transformer: numeric_transformer_1.numericTransformer,
    }),
    __metadata("design:type", Number)
], BillEntity.prototype, "unitPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'numeric',
        precision: 12,
        scale: 2,
        transformer: numeric_transformer_1.numericTransformer,
    }),
    __metadata("design:type", Number)
], BillEntity.prototype, "subtotal", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'numeric',
        precision: 12,
        scale: 2,
        default: 0,
        transformer: numeric_transformer_1.numericTransformer,
    }),
    __metadata("design:type", Number)
], BillEntity.prototype, "surcharge", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'numeric',
        precision: 12,
        scale: 2,
        default: 0,
        transformer: numeric_transformer_1.numericTransformer,
    }),
    __metadata("design:type", Number)
], BillEntity.prototype, "totalAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'numeric',
        precision: 12,
        scale: 2,
        default: 0,
        transformer: numeric_transformer_1.numericTransformer,
    }),
    __metadata("design:type", Number)
], BillEntity.prototype, "paidAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", String)
], BillEntity.prototype, "dueDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], BillEntity.prototype, "paidAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: bill_status_enum_1.BillStatus,
        default: bill_status_enum_1.BillStatus.GENERATED,
    }),
    __metadata("design:type", String)
], BillEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => payment_entity_1.PaymentEntity, (payment) => payment.bill),
    __metadata("design:type", Array)
], BillEntity.prototype, "payments", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], BillEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], BillEntity.prototype, "updatedAt", void 0);
exports.BillEntity = BillEntity = __decorate([
    (0, typeorm_1.Entity)({ name: 'bills' })
], BillEntity);
//# sourceMappingURL=bill.entity.js.map