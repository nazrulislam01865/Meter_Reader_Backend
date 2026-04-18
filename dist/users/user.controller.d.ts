import { UserService } from './user.service';
import { DashboardQueryDto } from './dto/dashboard-query.dto';
import { PayCurrentBillDto } from './dto/pay-current-bill.dto';
import { StatementParamsDto } from './dto/statement-params.dto';
import { UserEntity } from './entity/user.entity';
export declare class UserController {
    private readonly usersService;
    constructor(usersService: UserService);
    getUserDashboard(id: string, query: DashboardQueryDto): Promise<import("./dto/dashboard-response.dto").UserDashboardResponseDto>;
    getAllUsers(): Promise<{
        users: UserEntity[];
        total: number;
    }>;
    getUserPaymentHistory(id: string, query: DashboardQueryDto): Promise<{
        billId: string;
        monthLabel: string;
        amount: number;
        units: number;
        paidAt: string;
        paymentMethod: import("../common/enums/payment-method.enum").PaymentMethod;
        transactionReference: string | null;
    }[]>;
    getUserUsageHistory(id: string, query: DashboardQueryDto): Promise<{
        month: string;
        year: number;
        units: number;
    }[]>;
    payCurrentBill(id: string, dto: PayCurrentBillDto): Promise<{
        message: string;
        data: {
            paymentId: string;
            billId: string;
            amount: number;
            paymentMethod: import("../common/enums/payment-method.enum").PaymentMethod;
            status: import("../common/enums/payment-status.enum").PaymentStatus;
            paidAt: string;
            billStatus: import("../common/enums/bill-status.enum").BillStatus.PARTIALLY_PAID | import("../common/enums/bill-status.enum").BillStatus.PAID;
        };
    }>;
    getStatement(id: string, params: StatementParamsDto): Promise<{
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
            status: import("../common/enums/bill-status.enum").BillStatus;
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
}
