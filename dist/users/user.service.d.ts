import { Repository } from 'typeorm';
import { DashboardQueryDto } from './dto/dashboard-query.dto';
import { UserDashboardResponseDto } from './dto/dashboard-response.dto';
import { BillStatus } from '../common/enums/bill-status.enum';
import { PayCurrentBillDto } from './dto/pay-current-bill.dto';
import { PaymentStatus } from '../common/enums/payment-status.enum';
import { StatementParamsDto } from './dto/statement-params.dto';
import { UserEntity } from './entity/user.entity';
import { BillEntity } from './entity/bill.entity';
import { PaymentEntity } from './entity/payment.entity';
import { BillingSettingEntity } from './entity/billing-setting.entity';
import { MeterReadingEntity } from './entity/meter-reading.entity';
export declare class UserService {
    private readonly userRepository;
    private readonly billRepository;
    private readonly paymentRepository;
    private readonly billingSettingRepository;
    private readonly readingRepository;
    constructor(userRepository: Repository<UserEntity>, billRepository: Repository<BillEntity>, paymentRepository: Repository<PaymentEntity>, billingSettingRepository: Repository<BillingSettingEntity>, readingRepository: Repository<MeterReadingEntity>);
    getDashboard(userId: string, query: DashboardQueryDto): Promise<UserDashboardResponseDto>;
    getPaymentHistory(userId: string, limit?: number): Promise<{
        billId: string;
        monthLabel: string;
        amount: number;
        units: number;
        paidAt: string;
        paymentMethod: import("../common/enums/payment-method.enum").PaymentMethod;
        transactionReference: string | null;
    }[]>;
    getUsageHistory(userId: string, query: DashboardQueryDto): Promise<{
        month: string;
        year: number;
        units: number;
    }[]>;
    payCurrentBill(userId: string, dto: PayCurrentBillDto): Promise<{
        message: string;
        data: {
            paymentId: string;
            billId: string;
            amount: number;
            paymentMethod: import("../common/enums/payment-method.enum").PaymentMethod;
            status: PaymentStatus;
            paidAt: string;
            billStatus: BillStatus.PARTIALLY_PAID | BillStatus.PAID;
        };
    }>;
    getUser(): Promise<[UserEntity[], number]>;
    getStatement(userId: string, params: StatementParamsDto): Promise<{
        statementNumber: string;
        monthLabel: string;
        user: {
            id: string;
            fullName: string;
            email: string;
            meterNumber: string | null;
            zoneName: string | null;
        };
        bill: {
            id: string;
            unitsConsumed: number;
            unitPrice: number;
            subtotal: number;
            surcharge: number;
            totalAmount: number;
            paidAmount: number;
            dueDate: string;
            status: BillStatus;
        };
        payments: {
            id: string;
            amount: number;
            method: import("../common/enums/payment-method.enum").PaymentMethod;
            transactionReference: string | null;
            paidAt: string;
        }[];
        generatedAt: string;
    }>;
    private calculateYearlyTotal;
    private getSixMonthUsageHistory;
    private calculateUsageFromReadings;
    private calculateUsageProgress;
    private calculateAverageDailyUsage;
    private getPreviousMonth;
    private getShortMonthLabel;
    private getMonthLabel;
    private roundToTwo;
}
