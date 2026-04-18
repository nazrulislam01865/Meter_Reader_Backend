import { PaymentMethod } from '../../common/enums/payment-method.enum';
export declare class PayCurrentBillDto {
    paymentMethod: PaymentMethod;
    amount?: number;
    transactionReference?: string;
}
