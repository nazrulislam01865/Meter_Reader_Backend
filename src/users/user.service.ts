import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DashboardQueryDto } from './dto/dashboard-query.dto';
import { UserDashboardResponseDto } from './dto/dashboard-response.dto';
import { BillStatus } from '../common/enums/bill-status.enum';
import { PayCurrentBillDto } from './dto/pay-current-bill.dto';
import { PaymentStatus } from '../common/enums/payment-status.enum';
import { StatementParamsDto } from './dto/statement-params.dto';

import { ReadingStatus } from '../common/enums/reading-status.enum';
import { UserEntity } from './entity/user.entity';
import { BillEntity } from './entity/bill.entity';
import { PaymentEntity } from './entity/payment.entity';
import { BillingSettingEntity } from './entity/billing-setting.entity';
import { MeterReadingEntity } from './entity/meter-reading.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,

    @InjectRepository(BillEntity)
    private readonly billRepository: Repository<BillEntity>,

    @InjectRepository(PaymentEntity)
    private readonly paymentRepository: Repository<PaymentEntity>,

    @InjectRepository(BillingSettingEntity)
    private readonly billingSettingRepository: Repository<BillingSettingEntity>,

    @InjectRepository(MeterReadingEntity)
    private readonly readingRepository: Repository<MeterReadingEntity>,
  ) {}

  async getDashboard(
    userId: string,
    query: DashboardQueryDto,
  ): Promise<UserDashboardResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: { meter: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
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

    const currentMonthUsage =
      currentBill?.unitsConsumed ??
      (await this.calculateUsageFromReadings(userId, year, month));

    const lastMonthUsage = previousBill?.unitsConsumed ?? 0;
    const avgDailyKwh = this.calculateAverageDailyUsage(
      currentMonthUsage,
      year,
      month,
    );
    const yearlyTotalKwh = await this.calculateYearlyTotal(userId, year);
    const usageHistory = await this.getSixMonthUsageHistory(
      userId,
      year,
      month,
      historyLimit,
    );
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
        amount:
          currentBill?.totalAmount ??
          this.roundToTwo(
            currentMonthUsage * (latestBillingSetting?.unitPrice ?? 0),
          ),
        unitPrice:
          currentBill?.unitPrice ?? latestBillingSetting?.unitPrice ?? 0,
        unitsUsed: currentMonthUsage,
        progress: this.calculateUsageProgress(
          currentMonthUsage,
          user.meter?.monthlyUsageTargetKwh ?? 200,
        ),
        dueDate: currentBill?.dueDate ?? null,
        status: currentBill?.status ?? BillStatus.DRAFT,
        canPay: Boolean(currentBill && currentBill.status !== BillStatus.PAID),
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

  async getPaymentHistory(userId: string, limit = 10) {
    const payments = await this.paymentRepository.find({
      where: { userId, status: PaymentStatus.SUCCESS },
      relations: { bill: true },
      order: { paidAt: 'DESC' },
      take: limit,
    });

    return payments.map((payment) => ({
      billId: payment.billId,
      monthLabel: this.getMonthLabel(
        payment.bill.billingYear,
        payment.bill.billingMonth,
      ),
      amount: payment.amount,
      units: payment.bill.unitsConsumed,
      paidAt: payment.paidAt.toISOString(),
      paymentMethod: payment.method,
      transactionReference: payment.transactionReference ?? null,
    }));
  }

  async getUsageHistory(userId: string, query: DashboardQueryDto) {
    const today = new Date();
    const year = query.year ?? today.getFullYear();
    const month = query.month ?? today.getMonth() + 1;
    const historyLimit = query.historyLimit ?? 6;

    return this.getSixMonthUsageHistory(userId, year, month, historyLimit);
  }

  async payCurrentBill(userId: string, dto: PayCurrentBillDto) {
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
      throw new NotFoundException('Current bill not found');
    }

    if (bill.status === BillStatus.PAID) {
      throw new BadRequestException('Current bill is already paid');
    }

    const paymentAmount = dto.amount ?? bill.totalAmount - bill.paidAmount;

    if (paymentAmount <= 0) {
      throw new BadRequestException(
        'Payment amount must be greater than zero',
      );
    }

    const payment = this.paymentRepository.create({
      billId: bill.id,
      userId,
      amount: this.roundToTwo(paymentAmount),
      method: dto.paymentMethod,
      status: PaymentStatus.SUCCESS,
      transactionReference: dto.transactionReference ?? null,
      paidAt: new Date(),
    });

    const savedPayment = await this.paymentRepository.save(payment);

    bill.paidAmount = this.roundToTwo((bill.paidAmount ?? 0) + paymentAmount);
    bill.paidAt = savedPayment.paidAt;
    bill.status =
      bill.paidAmount >= bill.totalAmount
        ? BillStatus.PAID
        : BillStatus.PARTIALLY_PAID;

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

  async getUser(){
    return this.userRepository.findAndCount();
  }

  async getStatement(userId: string, params: StatementParamsDto) {
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
      throw new NotFoundException(
        'Statement not found for the requested month',
      );
    }

    const totalPaid =
      bill.payments
        ?.filter((payment) => payment.status === PaymentStatus.SUCCESS)
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
        .filter((payment) => payment.status === PaymentStatus.SUCCESS)
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

  private async calculateYearlyTotal(
    userId: string,
    year: number,
  ): Promise<number> {
    const bills = await this.billRepository.find({
      where: { userId, billingYear: year },
      select: { unitsConsumed: true },
    });

    return this.roundToTwo(
      bills.reduce((sum, bill) => sum + bill.unitsConsumed, 0),
    );
  }

  private async getSixMonthUsageHistory(
    userId: string,
    year: number,
    month: number,
    historyLimit: number,
  ) {
    const billHistory: Array<{ month: number; year: number }> = [];
    let cursorYear = year;
    let cursorMonth = month;

    for (let i = 0; i < historyLimit; i += 1) {
      billHistory.unshift({ month: cursorMonth, year: cursorYear });
      const previous = this.getPreviousMonth(cursorYear, cursorMonth);
      cursorYear = previous.year;
      cursorMonth = previous.month;
    }

    const items = await Promise.all(
      billHistory.map(async (item) => {
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
      }),
    );

    return items;
  }

  private async calculateUsageFromReadings(
    userId: string,
    year: number,
    month: number,
  ): Promise<number> {
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
        status: ReadingStatus.VERIFIED,
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

  private calculateUsageProgress(
    currentUsage: number,
    targetUsage: number,
  ): number {
    if (!targetUsage || targetUsage <= 0) {
      return 0;
    }

    const ratio = currentUsage / targetUsage;
    return Math.min(this.roundToTwo(ratio), 1);
  }

  private calculateAverageDailyUsage(
    units: number,
    year: number,
    month: number,
  ): number {
    const today = new Date();
    const sameMonth =
      today.getFullYear() === year && today.getMonth() + 1 === month;

    const daysInPeriod = sameMonth
      ? today.getDate()
      : new Date(year, month, 0).getDate();

    return this.roundToTwo(units / Math.max(daysInPeriod, 1));
  }

  private getPreviousMonth(year: number, month: number) {
    if (month === 1) {
      return { year: year - 1, month: 12 };
    }

    return { year, month: month - 1 };
  }

  private getShortMonthLabel(month: number): string {
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

  private getMonthLabel(year: number, month: number): string {
    return `${this.getShortMonthLabel(month)} ${year}`;
  }

  private roundToTwo(value: number): number {
    return Number(value.toFixed(2));
  }
}