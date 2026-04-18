export class UserDashboardResponseDto {
  user!: {
    id: string;
    fullName: string;
    meterNumber: string | null;
    zoneName: string | null;
    role: string;
  };

  currentBill!: {
    billId: string | null;
    billingMonth: string;
    amount: number;
    unitPrice: number;
    unitsUsed: number;
    progress: number;
    dueDate: string | null;
    status: string;
    canPay: boolean;
  };

  stats!: {
    thisMonthKwh: number;
    lastMonthKwh: number;
    avgDailyKwh: number;
    yearlyTotalKwh: number;
  };

  usageHistory!: Array<{
    month: string;
    year: number;
    units: number;
  }>;

  paymentHistory!: Array<{
    billId: string;
    monthLabel: string;
    amount: number;
    units: number;
    paidAt: string;
    paymentMethod: string;
    transactionReference: string | null;
  }>;
}