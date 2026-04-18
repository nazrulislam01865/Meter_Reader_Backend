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
exports.PaymentEntity = void 0;
const typeorm_1 = require("typeorm");
const numeric_transformer_1 = require("../../common/database/numeric.transformer");
const payment_method_enum_1 = require("../../common/enums/payment-method.enum");
const payment_status_enum_1 = require("../../common/enums/payment-status.enum");
const bill_entity_1 = require("./bill.entity");
const user_entity_1 = require("./user.entity");
let PaymentEntity = class PaymentEntity {
    id;
    billId;
    bill;
    userId;
    user;
    amount;
    method;
    status;
    transactionReference;
    paidAt;
    createdAt;
    updatedAt;
};
exports.PaymentEntity = PaymentEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PaymentEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bill_id', type: 'uuid' }),
    __metadata("design:type", String)
], PaymentEntity.prototype, "billId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => bill_entity_1.BillEntity, (bill) => bill.payments, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'bill_id' }),
    __metadata("design:type", bill_entity_1.BillEntity)
], PaymentEntity.prototype, "bill", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', type: 'uuid' }),
    __metadata("design:type", String)
], PaymentEntity.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.UserEntity, (user) => user.payments, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.UserEntity)
], PaymentEntity.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'numeric',
        precision: 12,
        scale: 2,
        transformer: numeric_transformer_1.numericTransformer,
    }),
    __metadata("design:type", Number)
], PaymentEntity.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: payment_method_enum_1.PaymentMethod,
    }),
    __metadata("design:type", String)
], PaymentEntity.prototype, "method", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: payment_status_enum_1.PaymentStatus,
        default: payment_status_enum_1.PaymentStatus.SUCCESS,
    }),
    __metadata("design:type", String)
], PaymentEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 120, nullable: true }),
    __metadata("design:type", Object)
], PaymentEntity.prototype, "transactionReference", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], PaymentEntity.prototype, "paidAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], PaymentEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], PaymentEntity.prototype, "updatedAt", void 0);
exports.PaymentEntity = PaymentEntity = __decorate([
    (0, typeorm_1.Entity)({ name: 'payments' })
], PaymentEntity);
//# sourceMappingURL=payment.entity.js.map