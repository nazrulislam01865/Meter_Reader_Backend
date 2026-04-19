import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { AuthService } from '../auth/auth.service';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { BillStatus } from '../common/enums/bill-status.enum';
import { ReadingSource } from '../common/enums/reading-source.enum';
import { ReadingStatus } from '../common/enums/reading-status.enum';
import { UserRole } from '../common/enums/user-role.enum';
import { UserStatus } from '../common/enums/user-status.enum';
import { BillEntity } from '../users/entity/bill.entity';
import { BillingSettingEntity } from '../users/entity/billing-setting.entity';
import { MeterEntity } from '../users/entity/meter.entity';
import { MeterReadingEntity } from '../users/entity/meter-reading.entity';
import { UserEntity } from '../users/entity/user.entity';
import { CreateManagedUserDto } from './dto/create-managed-user.dto';
import { CreateManualReadingDto } from './dto/create-manual-reading.dto';
import { ManagerUsersQueryDto } from './dto/manager-users-query.dto';
import { ReadingsQueryDto } from './dto/readings-query.dto';
import { UpdateManagedUserDto } from './dto/update-managed-user.dto';
import { UpdateUnitPriceDto } from './dto/update-unit-price.dto';

@Injectable()
export class ManagerService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly authService: AuthService,

    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,

    @InjectRepository(MeterEntity)
    private readonly meterRepository: Repository<MeterEntity>,

    @InjectRepository(MeterReadingEntity)
    private readonly readingRepository: Repository<MeterReadingEntity>,

    @InjectRepository(BillingSettingEntity)
    private readonly billingSettingRepository: Repository<BillingSettingEntity>,

    @InjectRepository(BillEntity)
    private readonly billRepository: Repository<BillEntity>,
  ) {}

  async getDashboardSummary() {
    const now = new Date();
    const current = this.getMonthLabel(now.getFullYear(), now.getMonth() + 1);
    const previousDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previous = this.getMonthLabel(
      previousDate.getFullYear(),
      previousDate.getMonth() + 1,
    );

    const [meterCount, activeUnitPrice] = await Promise.all([
      this.meterRepository.count({
        where: { isActive: true },
      }),
      this.billingSettingRepository.findOne({
        where: { isActive: true },
        order: { effectiveFrom: 'DESC', createdAt: 'DESC' },
      }),
    ]);

    return {
      summary: {
        currentMonth: current,
        previousMonth: previous,
        totalMeters: meterCount,
        unitPrice: activeUnitPrice?.unitPrice ?? 0,
      },
    };
  }

  async createManagedUser(
    actor: AuthenticatedUser,
    dto: CreateManagedUserDto,
  ) {
    this.assertCanAssignRole(actor.role, dto.role);

    const [existingEmail, existingUsername] = await Promise.all([
      this.userRepository.findOne({
        where: { email: dto.email.toLowerCase().trim() },
        withDeleted: true,
      }),
      this.userRepository.findOne({
        where: { username: dto.username.trim() },
        withDeleted: true,
      }),
    ]);

    if (existingEmail) {
      throw new BadRequestException('Email is already in use');
    }

    if (existingUsername) {
      throw new BadRequestException('Username is already in use');
    }

    const temporaryPassword = this.authService.generateTemporaryPassword(10);
    const hashedPassword = await this.authService.hashPassword(temporaryPassword);

    const user = this.userRepository.create({
      fullName: dto.fullName.trim(),
      email: dto.email.toLowerCase().trim(),
      phone: dto.phone?.trim() ?? null,
      username: dto.username.trim(),
      password: hashedPassword,
      role: dto.role,
      zoneId: dto.zoneId?.trim() ?? null,
      zoneName: dto.zoneName?.trim() ?? null,
      status: UserStatus.ACTIVE,
      passwordResetRequired: true,
    });

    const savedUser = await this.userRepository.save(user);

    return {
      message: 'User created successfully',
      data: {
        id: savedUser.id,
        fullName: savedUser.fullName,
        email: savedUser.email,
        username: savedUser.username,
        role: savedUser.role,
        zoneName: savedUser.zoneName ?? null,
        status: savedUser.status,
        temporaryPassword,
      },
    };
  }

  async listManagedUsers(query: ManagerUsersQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const qb = this.userRepository.createQueryBuilder('user');

    qb.where('user.role != :customerRole', {
      customerRole: UserRole.CUSTOMER,
    });

    if (query.search) {
      qb.andWhere(
        `(
          LOWER(user.fullName) LIKE LOWER(:search)
          OR LOWER(user.email) LIKE LOWER(:search)
          OR LOWER(user.username) LIKE LOWER(:search)
          OR LOWER(COALESCE(user.phone, '')) LIKE LOWER(:search)
          OR LOWER(COALESCE(user.zoneName, '')) LIKE LOWER(:search)
        )`,
        { search: `%${query.search.trim()}%` },
      );
    }

    if (query.role) {
      qb.andWhere('user.role = :role', { role: query.role });
    }

    if (query.status) {
      qb.andWhere('user.status = :status', { status: query.status });
    }

    qb.orderBy('user.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      data: items.map((user) => ({
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone ?? null,
        username: user.username,
        role: user.role,
        status: user.status,
        zoneId: user.zoneId ?? null,
        zoneName: user.zoneName ?? null,
        createdAt: user.createdAt,
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getManagedUserById(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      data: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone ?? null,
        username: user.username,
        role: user.role,
        status: user.status,
        zoneId: user.zoneId ?? null,
        zoneName: user.zoneName ?? null,
        createdAt: user.createdAt,
      },
    };
  }

  async updateManagedUser(
    actor: AuthenticatedUser,
    id: string,
    dto: UpdateManagedUserDto,
  ) {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    this.assertCanChangeExistingUser(actor.role, user.role, id, actor.sub);

    if (dto.role) {
      this.assertCanAssignRole(actor.role, dto.role);
    }

    if (dto.email && dto.email.toLowerCase().trim() !== user.email) {
      const existingEmail = await this.userRepository.findOne({
        where: { email: dto.email.toLowerCase().trim() },
        withDeleted: true,
      });

      if (existingEmail && existingEmail.id !== user.id) {
        throw new BadRequestException('Email is already in use');
      }
    }

    if (dto.username && dto.username.trim() !== user.username) {
      const existingUsername = await this.userRepository.findOne({
        where: { username: dto.username.trim() },
        withDeleted: true,
      });

      if (existingUsername && existingUsername.id !== user.id) {
        throw new BadRequestException('Username is already in use');
      }
    }

    user.fullName = dto.fullName?.trim() ?? user.fullName;
    user.email = dto.email?.toLowerCase().trim() ?? user.email;
    user.phone = dto.phone?.trim() ?? user.phone;
    user.username = dto.username?.trim() ?? user.username;
    user.role = dto.role ?? user.role;
    user.status = dto.status ?? user.status;
    user.zoneId = dto.zoneId?.trim() ?? user.zoneId;
    user.zoneName = dto.zoneName?.trim() ?? user.zoneName;

    const updated = await this.userRepository.save(user);

    return {
      message: 'User updated successfully',
      data: {
        id: updated.id,
        fullName: updated.fullName,
        email: updated.email,
        phone: updated.phone ?? null,
        username: updated.username,
        role: updated.role,
        status: updated.status,
        zoneId: updated.zoneId ?? null,
        zoneName: updated.zoneName ?? null,
      },
    };
  }

  async deleteManagedUser(actor: AuthenticatedUser, id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    this.assertCanChangeExistingUser(actor.role, user.role, id, actor.sub);

    await this.userRepository.softRemove(user);

    return {
      message: 'User deleted successfully',
      data: {
        id: user.id,
        fullName: user.fullName,
      },
    };
  }

  async submitManualReading(
    actor: AuthenticatedUser,
    dto: CreateManualReadingDto,
  ) {
    if (dto.currentReading < dto.previousReading) {
      throw new BadRequestException(
        'Current reading cannot be less than previous reading',
      );
    }

    const meter = await this.meterRepository.findOne({
      where: { meterNumber: dto.meterNumber.trim(), isActive: true },
      relations: { user: true },
    });

    if (!meter || !meter.user) {
      throw new NotFoundException('Active meter not found');
    }

    const usageKwh = this.roundToTwo(dto.currentReading - dto.previousReading);
    const readingDate = new Date(dto.readingDate);

    const duplicate = await this.readingRepository.findOne({
      where: {
        meterId: meter.id,
        readingValue: dto.currentReading,
        readingDate,
      },
    });

    if (duplicate) {
      throw new BadRequestException('This reading already exists');
    }

    const activeUnitPrice = await this.billingSettingRepository.findOne({
      where: { isActive: true },
      order: { effectiveFrom: 'DESC', createdAt: 'DESC' },
    });

    if (!activeUnitPrice) {
      throw new BadRequestException('No active unit price is configured');
    }

    const result = await this.dataSource.transaction(async (manager) => {
      const readingRepo = manager.getRepository(MeterReadingEntity);
      const billRepo = manager.getRepository(BillEntity);

      const reading = readingRepo.create({
        meterId: meter.id,
        userId: meter.userId,
        enteredByUserId: actor.sub,
        previousReadingValue: dto.previousReading,
        readingValue: dto.currentReading,
        usageKwh,
        readingDate,
        source: ReadingSource.MANUAL,
        status: ReadingStatus.VERIFIED,
        notes: dto.notes?.trim() ?? null,
      });

      const savedReading = await readingRepo.save(reading);

      const billingYear = readingDate.getFullYear();
      const billingMonth = readingDate.getMonth() + 1;
      const subtotal = this.roundToTwo(usageKwh * activeUnitPrice.unitPrice);

      let bill = await billRepo.findOne({
        where: {
          userId: meter.userId,
          billingYear,
          billingMonth,
        },
        order: { createdAt: 'DESC' },
      });

      if (!bill) {
        bill = billRepo.create({
          userId: meter.userId,
          billingYear,
          billingMonth,
          unitsConsumed: usageKwh,
          unitPrice: activeUnitPrice.unitPrice,
          subtotal,
          surcharge: 0,
          totalAmount: subtotal,
          paidAmount: 0,
          dueDate: this.buildDueDate(readingDate),
          status: BillStatus.GENERATED,
        });
      } else {
        bill.unitsConsumed = usageKwh;
        bill.unitPrice = activeUnitPrice.unitPrice;
        bill.subtotal = subtotal;
        bill.totalAmount = this.roundToTwo(subtotal + (bill.surcharge ?? 0));
        if (bill.paidAmount >= bill.totalAmount) {
          bill.status = BillStatus.PAID;
        } else if (bill.paidAmount > 0) {
          bill.status = BillStatus.PARTIALLY_PAID;
        } else {
          bill.status = BillStatus.GENERATED;
        }
      }

      const savedBill = await billRepo.save(bill);

      return { savedReading, savedBill };
    });

    return {
      message: 'Manual reading submitted successfully',
      data: {
        readingId: result.savedReading.id,
        meterNumber: meter.meterNumber,
        customerId: meter.userId,
        customerName: meter.user.fullName,
        zoneName: meter.user.zoneName ?? null,
        previousReading: dto.previousReading,
        currentReading: dto.currentReading,
        usageKwh,
        billId: result.savedBill.id,
        billAmount: result.savedBill.totalAmount,
        unitPrice: result.savedBill.unitPrice,
        status: 'Submitted',
      },
    };
  }

  async getAllReadings(query: ReadingsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const now = new Date();
    const year = query.year ?? now.getFullYear();
    const month = query.month ?? now.getMonth() + 1;

    const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const end = new Date(year, month, 1, 0, 0, 0, 0);

    const qb = this.readingRepository
      .createQueryBuilder('reading')
      .leftJoinAndSelect('reading.meter', 'meter')
      .leftJoinAndSelect('reading.user', 'user')
      .leftJoinAndSelect('reading.enteredBy', 'enteredBy')
      .where('reading.readingDate >= :start', { start: start.toISOString() })
      .andWhere('reading.readingDate < :end', { end: end.toISOString() });

    if (query.search) {
      qb.andWhere(
        `(
          LOWER(meter.meterNumber) LIKE LOWER(:search)
          OR LOWER(user.fullName) LIKE LOWER(:search)
          OR LOWER(COALESCE(user.zoneName, '')) LIKE LOWER(:search)
        )`,
        { search: `%${query.search.trim()}%` },
      );
    }

    if (query.status && query.status !== 'All') {
      const mappedStatus =
        query.status === 'Submitted'
          ? ReadingStatus.VERIFIED
          : query.status === 'Pending'
            ? ReadingStatus.PENDING
            : ReadingStatus.REJECTED;

      qb.andWhere('reading.status = :status', { status: mappedStatus });
    }

    qb.orderBy('reading.readingDate', 'DESC')
      .addOrderBy('reading.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      data: items.map((reading) => ({
        id: reading.id,
        meterId: reading.meter.meterNumber,
        customer: reading.user.fullName,
        zone: reading.user.zoneName ?? null,
        value: reading.usageKwh ?? 0,
        unit: 'kWh',
        date: this.formatReadingDate(reading.readingDate),
        status: this.mapReadingStatusToUi(reading.status),
        currentReading: reading.readingValue,
        previousReading: reading.previousReadingValue ?? null,
        notes: reading.notes ?? null,
        enteredBy: reading.enteredBy?.username ?? null,
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getCurrentUnitPrice() {
    const currentSetting = await this.billingSettingRepository.findOne({
      where: { isActive: true },
      order: { effectiveFrom: 'DESC', createdAt: 'DESC' },
    });

    return {
      data: {
        unitPrice: currentSetting?.unitPrice ?? 0,
        effectiveFrom: currentSetting?.effectiveFrom ?? null,
      },
    };
  }

  async updateUnitPrice(dto: UpdateUnitPriceDto) {
    const effectiveFrom = dto.effectiveFrom
      ? new Date(dto.effectiveFrom)
      : new Date();

    const result = await this.dataSource.transaction(async (manager) => {
      const settingsRepo = manager.getRepository(BillingSettingEntity);

      await settingsRepo
        .createQueryBuilder()
        .update(BillingSettingEntity)
        .set({ isActive: false })
        .where('isActive = :isActive', { isActive: true })
        .execute();

      const created = settingsRepo.create({
        unitPrice: dto.unitPrice,
        effectiveFrom,
        isActive: true,
      });

      return settingsRepo.save(created);
    });

    return {
      message: 'Unit price updated successfully',
      data: {
        id: result.id,
        unitPrice: result.unitPrice,
        effectiveFrom: result.effectiveFrom,
      },
    };
  }

  private assertCanAssignRole(actorRole: UserRole, targetRole: UserRole) {
    if (actorRole === UserRole.ADMIN) {
      return;
    }

    if (actorRole === UserRole.MANAGER) {
      if ([UserRole.ADMIN, UserRole.MANAGER].includes(targetRole)) {
        throw new ForbiddenException(
          'Managers cannot create or assign admin/manager accounts',
        );
      }
      return;
    }

    throw new ForbiddenException('You are not allowed to manage users');
  }

  private assertCanChangeExistingUser(
    actorRole: UserRole,
    targetRole: UserRole,
    targetUserId: string,
    actorUserId: string,
  ) {
    if (targetUserId === actorUserId) {
      throw new BadRequestException('You cannot modify or delete your own account here');
    }

    if (actorRole === UserRole.ADMIN) {
      return;
    }

    if (actorRole === UserRole.MANAGER) {
      if ([UserRole.ADMIN, UserRole.MANAGER].includes(targetRole)) {
        throw new ForbiddenException(
          'Managers cannot modify or delete admin/manager accounts',
        );
      }
      return;
    }

    throw new ForbiddenException('You are not allowed to manage this user');
  }

  private buildDueDate(readingDate: Date): string {
    const dueDate = new Date(
      readingDate.getFullYear(),
      readingDate.getMonth() + 1,
      10,
      0,
      0,
      0,
      0,
    );

    return dueDate.toISOString().slice(0, 10);
  }

  private getMonthLabel(year: number, month: number): string {
    return `${this.getShortMonthLabel(month)} ${year}`;
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

  private formatReadingDate(date: Date): string {
    const month = this.getShortMonthLabel(date.getMonth() + 1);
    return `${month} ${date.getDate()}`;
  }

  private mapReadingStatusToUi(status: ReadingStatus): string {
    if (status === ReadingStatus.VERIFIED) {
      return 'Submitted';
    }

    if (status === ReadingStatus.PENDING) {
      return 'Pending';
    }

    return 'Rejected';
  }

  private roundToTwo(value: number): number {
    return Number(value.toFixed(2));
  }
}