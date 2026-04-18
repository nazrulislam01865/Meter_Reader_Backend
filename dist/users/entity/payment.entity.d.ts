import { PaymentMethod } from '../../common/enums/payment-method.enum';
import { PaymentStatus } from '../../common/enums/payment-status.enum';
import { BillEntity } from './bill.entity';
import { UserEntity } from './user.entity';
export declare class PaymentEntity {
    id: string;
    billId: string;
    bill: BillEntity;
    userId: string;
    user: UserEntity;
    amount: number;
    method: PaymentMethod;
    status: PaymentStatus;
    transactionReference?: string | null;
    paidAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
