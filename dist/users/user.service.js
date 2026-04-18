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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bill_status_enum_1 = require("../common/enums/bill-status.enum");
const payment_status_enum_1 = require("../common/enums/payment-status.enum");
const reading_status_enum_1 = require("../common/enums/reading-status.enum");
const user_entity_1 = require("./entity/user.entity");
const bill_entity_1 = require("./entity/bill.entity");
const payment_entity_1 = require("./entity/payment.entity");
const billing_setting_entity_1 = require("./entity/billing-setting.entity");
const meter_reading_entity_1 = require("./entity/meter-reading.entity");
let UserService = class UserService {
    userRepository;
    billRepository;
    paymentRepository;
    billingSettingRepository;
    readingRepository;
    constructor(userRepository, billRepository, paymentRepository, billingSettingRepository, readingRepository) {
        this.userRepository = userRepository;
        this.billRepository = billRepository;
        this.paymentRepository = paymentRepository;
        this.billingSettingRepository = billingSettingRepository;
        this.readingRepository = readingRepository;
    }
    async getDashboard(userId, query) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: { meter: true },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const today = new Date();
        const year = query.year ?? today.getFullYear();
        const month = query.month ?? today.getMonth() + 1;
        const historyLimit = query.historyLimit ?? 6;
        const currentBill = await this.billRepository.findOne({
            where: { userId, billingYear: year, billingMonth: month },
            order: { createdAt: 'DESC' },
        });
        const previousPeriod = this.getPreviousMonth(year, month);
        const previousBill = await this.billRepository.findOne({
            where: {
                userId,
                billingYear: previousPeriod.year,
                billingMonth: previousPeriod.month,
            },
            order: { createdAt: 'DESC' },
        });
        const latestBillingSetting = await this.billingSettingRepository.findOne({
            where: { isActive: true },
            order: { effectiveFrom: 'DESC', createdAt: 'DESC' },
        });
        const currentMonthUsage = currentBill?.unitsConsumed ??
            (await this.calculateUsageFromReadings(userId, year, month));
        const lastMonthUsage = previousBill?.unitsConsumed ?? 0;
        const avgDailyKwh = this.calculateAverageDailyUsage(currentMonthUsage, year, month);
        const yearlyTotalKwh = await this.calculateYearlyTotal(userId, year);
        const usageHistory = await this.getSixMonthUsageHistory(userId, year, month, historyLimit);
        const paymentHistory = await this.getPaymentHistory(userId, 6);
        return {
            user: {
                id: user.id,
                fullName: user.fullName,
                meterNumber: user.meter?.meterNumber ?? null,
                zoneName: user.zoneName ?? null,
                role: user.role,
            },
            currentBill: {
                billId: currentBill?.id ?? null,
                billingMonth: this.getMonthLabel(year, month),
                amount: currentBill?.totalAmount ??
                    this.roundToTwo(currentMonthUsage * (latestBillingSetting?.unitPrice ?? 0)),
                unitPrice: currentBill?.unitPrice ?? latestBillingSetting?.unitPrice ?? 0,
                unitsUsed: currentMonthUsage,
                progress: this.calculateUsageProgress(currentMonthUsage, user.meter?.monthlyUsageTargetKwh ?? 200),
                dueDate: currentBill?.dueDate ?? null,
                status: currentBill?.status ?? bill_status_enum_1.BillStatus.DRAFT,
                canPay: Boolean(currentBill && currentBill.status !== bill_status_enum_1.BillStatus.PAID),
            },
            stats: {
                thisMonthKwh: currentMonthUsage,
                lastMonthKwh: lastMonthUsage,
                avgDailyKwh,
                yearlyTotalKwh,
            },
            usageHistory,
            paymentHistory,
        };
    }
    async getPaymentHistory(userId, limit = 10) {
        const payments = await this.paymentRepository.find({
            where: { userId, status: payment_status_enum_1.PaymentStatus.SUCCESS },
            relations: { bill: true },
            order: { paidAt: 'DESC' },
            take: limit,
        });
        return payments.map((payment) => ({
            billId: payment.billId,
            monthLabel: this.getMonthLabel(payment.bill.billingYear, payment.bill.billingMonth),
            amount: payment.amount,
            units: payment.bill.unitsConsumed,
            paidAt: payment.paidAt.toISOString(),
            paymentMethod: payment.method,
            transactionReference: payment.transactionReference ?? null,
        }));
    }
    async getUsageHistory(userId, query) {
        const today = new Date();
        const year = query.year ?? today.getFullYear();
        const month = query.month ?? today.getMonth() + 1;
        const historyLimit = query.historyLimit ?? 6;
        return this.getSixMonthUsageHistory(userId, year, month, historyLimit);
    }
    async payCurrentBill(userId, dto) {
        const today = new Date();
        const bill = await this.billRepository.findOne({
            where: {
                userId,
                billingYear: today.getFullYear(),
                billingMonth: today.getMonth() + 1,
            },
            order: { createdAt: 'DESC' },
        });
        if (!bill) {
            throw new common_1.NotFoundException('Current bill not found');
        }
        if (bill.status === bill_status_enum_1.BillStatus.PAID) {
            throw new common_1.BadRequestException('Current bill is already paid');
        }
        const paymentAmount = dto.amount ?? bill.totalAmount - bill.paidAmount;
        if (paymentAmount <= 0) {
            throw new common_1.BadRequestException('Payment amount must be greater than zero');
        }
        const payment = this.paymentRepository.create({
            billId: bill.id,
            userId,
            amount: this.roundToTwo(paymentAmount),
            method: dto.paymentMethod,
            status: payment_status_enum_1.PaymentStatus.SUCCESS,
            transactionReference: dto.transactionReference ?? null,
            paidAt: new Date(),
        });
        const savedPayment = await this.paymentRepository.save(payment);
        bill.paidAmount = this.roundToTwo((bill.paidAmount ?? 0) + paymentAmount);
        bill.paidAt = savedPayment.paidAt;
        bill.status =
            bill.paidAmount >= bill.totalAmount
                ? bill_status_enum_1.BillStatus.PAID
                : bill_status_enum_1.BillStatus.PARTIALLY_PAID;
        await this.billRepository.save(bill);
        return {
            message: 'Bill payment recorded successfully',
            data: {
                paymentId: savedPayment.id,
                billId: bill.id,
                amount: savedPayment.amount,
                paymentMethod: savedPayment.method,
                status: savedPayment.status,
                paidAt: savedPayment.paidAt.toISOString(),
                billStatus: bill.status,
            },
        };
    }
    async getUser() {
        return this.userRepository.findAndCount();
    }
    async getStatement(userId, params) {
        const bill = await this.billRepository.findOne({
            where: {
                userId,
                billingYear: params.year,
                billingMonth: params.month,
            },
            relations: { user: { meter: true }, payments: true },
            order: { createdAt: 'DESC' },
        });
        if (!bill) {
            throw new common_1.NotFoundException('Statement not found for the requested month');
        }
        const totalPaid = bill.payments
            ?.filter((payment) => payment.status === payment_status_enum_1.PaymentStatus.SUCCESS)
            .reduce((sum, payment) => sum + payment.amount, 0) ?? 0;
        return {
            statementNumber: `STM-${params.year}${String(params.month).padStart(2, '0')}-${bill.id.slice(0, 8)}`,
            monthLabel: this.getMonthLabel(params.year, params.month),
            user: {
                id: bill.user.id,
                fullName: bill.user.fullName,
                email: bill.user.email,
                meterNumber: bill.user.meter?.meterNumber ?? null,
                zoneName: bill.user.zoneName ?? null,
            },
            bill: {
                id: bill.id,
                unitsConsumed: bill.unitsConsumed,
                unitPrice: bill.unitPrice,
                subtotal: bill.subtotal,
                surcharge: bill.surcharge,
                totalAmount: bill.totalAmount,
                paidAmount: totalPaid,
                dueDate: bill.dueDate,
                status: bill.status,
            },
            payments: (bill.payments ?? [])
                .filter((payment) => payment.status === payment_status_enum_1.PaymentStatus.SUCCESS)
                .sort((a, b) => b.paidAt.getTime() - a.paidAt.getTime())
                .map((payment) => ({
                id: payment.id,
                amount: payment.amount,
                method: payment.method,
                transactionReference: payment.transactionReference ?? null,
                paidAt: payment.paidAt.toISOString(),
            })),
            generatedAt: new Date().toISOString(),
        };
    }
    async calculateYearlyTotal(userId, year) {
        const bills = await this.billRepository.find({
            where: { userId, billingYear: year },
            select: { unitsConsumed: true },
        });
        return this.roundToTwo(bills.reduce((sum, bill) => sum + bill.unitsConsumed, 0));
    }
    async getSixMonthUsageHistory(userId, year, month, historyLimit) {
        const billHistory = [];
        let cursorYear = year;
        let cursorMonth = month;
        for (let i = 0; i < historyLimit; i += 1) {
            billHistory.unshift({ month: cursorMonth, year: cursorYear });
            const previous = this.getPreviousMonth(cursorYear, cursorMonth);
            cursorYear = previous.year;
            cursorMonth = previous.month;
        }
        const items = await Promise.all(billHistory.map(async (item) => {
            const bill = await this.billRepository.findOne({
                where: {
                    userId,
                    billingYear: item.year,
                    billingMonth: item.month,
                },
                order: { createdAt: 'DESC' },
            });
            return {
                month: this.getShortMonthLabel(item.month),
                year: item.year,
                units: bill?.unitsConsumed ?? 0,
            };
        }));
        return items;
    }
    async calculateUsageFromReadings(userId, year, month) {
        const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
        const end = new Date(Date.UTC(year, month, 1, 0, 0, 0));
        const readings = await this.readingRepository
            .createQueryBuilder('reading')
            .where('reading.user_id = :userId', { userId })
            .andWhere('reading.readingDate >= :start', {
            start: start.toISOString(),
        })
            .andWhere('reading.readingDate < :end', {
            end: end.toISOString(),
        })
            .andWhere('reading.status = :status', {
            status: reading_status_enum_1.ReadingStatus.VERIFIED,
        })
            .orderBy('reading.readingDate', 'ASC')
            .getMany();
        if (readings.length < 2) {
            return 0;
        }
        const firstReading = readings[0].readingValue;
        const lastReading = readings[readings.length - 1].readingValue;
        return this.roundToTwo(Math.max(lastReading - firstReading, 0));
    }
    calculateUsageProgress(currentUsage, targetUsage) {
        if (!targetUsage || targetUsage <= 0) {
            return 0;
        }
        const ratio = currentUsage / targetUsage;
        return Math.min(this.roundToTwo(ratio), 1);
    }
    calculateAverageDailyUsage(units, year, month) {
        const today = new Date();
        const sameMonth = today.getFullYear() === year && today.getMonth() + 1 === month;
        const daysInPeriod = sameMonth
            ? today.getDate()
            : new Date(year, month, 0).getDate();
        return this.roundToTwo(units / Math.max(daysInPeriod, 1));
    }
    getPreviousMonth(year, month) {
        if (month === 1) {
            return { year: year - 1, month: 12 };
        }
        return { year, month: month - 1 };
    }
    getShortMonthLabel(month) {
        return [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
        ][month - 1];
    }
    getMonthLabel(year, month) {
        return `${this.getShortMonthLabel(month)} ${year}`;
    }
    roundToTwo(value) {
        return Number(value.toFixed(2));
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(bill_entity_1.BillEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(payment_entity_1.PaymentEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(billing_setting_entity_1.BillingSettingEntity)),
    __param(4, (0, typeorm_1.InjectRepository)(meter_reading_entity_1.MeterReadingEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], UserService);
//# sourceMappingURL=user.service.js.map