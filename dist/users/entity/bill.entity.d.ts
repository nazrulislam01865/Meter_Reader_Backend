import { BillStatus } from '../../common/enums/bill-status.enum';
import { UserEntity } from './user.entity';
import { PaymentEntity } from './payment.entity';
export declare class BillEntity {
    id: string;
    userId: string;
    user: UserEntity;
    billingYear: number;
    billingMonth: number;
    unitsConsumed: number;
    unitPrice: number;
    subtotal: number;
    surcharge: number;
    totalAmount: number;
    paidAmount: number;
    dueDate: string;
    paidAt?: Date | null;
    status: BillStatus;
    payments?: PaymentEntity[];
    createdAt: Date;
    updatedAt: Date;
}
