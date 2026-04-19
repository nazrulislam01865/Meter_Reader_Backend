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
exports.ManagerService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const auth_service_1 = require("../auth/auth.service");
const bill_status_enum_1 = require("../common/enums/bill-status.enum");
const reading_source_enum_1 = require("../common/enums/reading-source.enum");
const reading_status_enum_1 = require("../common/enums/reading-status.enum");
const user_role_enum_1 = require("../common/enums/user-role.enum");
const user_status_enum_1 = require("../common/enums/user-status.enum");
const bill_entity_1 = require("../users/entity/bill.entity");
const billing_setting_entity_1 = require("../users/entity/billing-setting.entity");
const meter_entity_1 = require("../users/entity/meter.entity");
const meter_reading_entity_1 = require("../users/entity/meter-reading.entity");
const user_entity_1 = require("../users/entity/user.entity");
let ManagerService = class ManagerService {
    dataSource;
    authService;
    userRepository;
    meterRepository;
    readingRepository;
    billingSettingRepository;
    billRepository;
    constructor(dataSource, authService, userRepository, meterRepository, readingRepository, billingSettingRepository, billRepository) {
        this.dataSource = dataSource;
        this.authService = authService;
        this.userRepository = userRepository;
        this.meterRepository = meterRepository;
        this.readingRepository = readingRepository;
        this.billingSettingRepository = billingSettingRepository;
        this.billRepository = billRepository;
    }
    async getDashboardSummary() {
        const now = new Date();
        const current = this.getMonthLabel(now.getFullYear(), now.getMonth() + 1);
        const previousDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const previous = this.getMonthLabel(previousDate.getFullYear(), previousDate.getMonth() + 1);
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
    async createManagedUser(actor, dto) {
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
            throw new common_1.BadRequestException('Email is already in use');
        }
        if (existingUsername) {
            throw new common_1.BadRequestException('Username is already in use');
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
            status: user_status_enum_1.UserStatus.ACTIVE,
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
    async listManagedUsers(query) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 10;
        const qb = this.userRepository.createQueryBuilder('user');
        qb.where('user.role != :customerRole', {
            customerRole: user_role_enum_1.UserRole.CUSTOMER,
        });
        if (query.search) {
            qb.andWhere(`(
          LOWER(user.fullName) LIKE LOWER(:search)
          OR LOWER(user.email) LIKE LOWER(:search)
          OR LOWER(user.username) LIKE LOWER(:search)
          OR LOWER(COALESCE(user.phone, '')) LIKE LOWER(:search)
          OR LOWER(COALESCE(user.zoneName, '')) LIKE LOWER(:search)
        )`, { search: `%${query.search.trim()}%` });
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
    async getManagedUserById(id) {
        const user = await this.userRepository.findOne({
            where: { id },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
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
    async updateManagedUser(actor, id, dto) {
        const user = await this.userRepository.findOne({
            where: { id },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
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
                throw new common_1.BadRequestException('Email is already in use');
            }
        }
        if (dto.username && dto.username.trim() !== user.username) {
            const existingUsername = await this.userRepository.findOne({
                where: { username: dto.username.trim() },
                withDeleted: true,
            });
            if (existingUsername && existingUsername.id !== user.id) {
                throw new common_1.BadRequestException('Username is already in use');
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
    async deleteManagedUser(actor, id) {
        const user = await this.userRepository.findOne({
            where: { id },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
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
    async submitManualReading(actor, dto) {
        if (dto.currentReading < dto.previousReading) {
            throw new common_1.BadRequestException('Current reading cannot be less than previous reading');
        }
        const meter = await this.meterRepository.findOne({
            where: { meterNumber: dto.meterNumber.trim(), isActive: true },
            relations: { user: true },
        });
        if (!meter || !meter.user) {
            throw new common_1.NotFoundException('Active meter not found');
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
            throw new common_1.BadRequestException('This reading already exists');
        }
        const activeUnitPrice = await this.billingSettingRepository.findOne({
            where: { isActive: true },
            order: { effectiveFrom: 'DESC', createdAt: 'DESC' },
        });
        if (!activeUnitPrice) {
            throw new common_1.BadRequestException('No active unit price is configured');
        }
        const result = await this.dataSource.transaction(async (manager) => {
            const readingRepo = manager.getRepository(meter_reading_entity_1.MeterReadingEntity);
            const billRepo = manager.getRepository(bill_entity_1.BillEntity);
            const reading = readingRepo.create({
                meterId: meter.id,
                userId: meter.userId,
                enteredByUserId: actor.sub,
                previousReadingValue: dto.previousReading,
                readingValue: dto.currentReading,
                usageKwh,
                readingDate,
                source: reading_source_enum_1.ReadingSource.MANUAL,
                status: reading_status_enum_1.ReadingStatus.VERIFIED,
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
                    status: bill_status_enum_1.BillStatus.GENERATED,
                });
            }
            else {
                bill.unitsConsumed = usageKwh;
                bill.unitPrice = activeUnitPrice.unitPrice;
                bill.subtotal = subtotal;
                bill.totalAmount = this.roundToTwo(subtotal + (bill.surcharge ?? 0));
                if (bill.paidAmount >= bill.totalAmount) {
                    bill.status = bill_status_enum_1.BillStatus.PAID;
                }
                else if (bill.paidAmount > 0) {
                    bill.status = bill_status_enum_1.BillStatus.PARTIALLY_PAID;
                }
                else {
                    bill.status = bill_status_enum_1.BillStatus.GENERATED;
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
    async getAllReadings(query) {
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
            qb.andWhere(`(
          LOWER(meter.meterNumber) LIKE LOWER(:search)
          OR LOWER(user.fullName) LIKE LOWER(:search)
          OR LOWER(COALESCE(user.zoneName, '')) LIKE LOWER(:search)
        )`, { search: `%${query.search.trim()}%` });
        }
        if (query.status && query.status !== 'All') {
            const mappedStatus = query.status === 'Submitted'
                ? reading_status_enum_1.ReadingStatus.VERIFIED
                : query.status === 'Pending'
                    ? reading_status_enum_1.ReadingStatus.PENDING
                    : reading_status_enum_1.ReadingStatus.REJECTED;
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
    async updateUnitPrice(dto) {
        const effectiveFrom = dto.effectiveFrom
            ? new Date(dto.effectiveFrom)
            : new Date();
        const result = await this.dataSource.transaction(async (manager) => {
            const settingsRepo = manager.getRepository(billing_setting_entity_1.BillingSettingEntity);
            await settingsRepo
                .createQueryBuilder()
                .update(billing_setting_entity_1.BillingSettingEntity)
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
    assertCanAssignRole(actorRole, targetRole) {
        if (actorRole === user_role_enum_1.UserRole.ADMIN) {
            return;
        }
        if (actorRole === user_role_enum_1.UserRole.MANAGER) {
            if ([user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.MANAGER].includes(targetRole)) {
                throw new common_1.ForbiddenException('Managers cannot create or assign admin/manager accounts');
            }
            return;
        }
        throw new common_1.ForbiddenException('You are not allowed to manage users');
    }
    assertCanChangeExistingUser(actorRole, targetRole, targetUserId, actorUserId) {
        if (targetUserId === actorUserId) {
            throw new common_1.BadRequestException('You cannot modify or delete your own account here');
        }
        if (actorRole === user_role_enum_1.UserRole.ADMIN) {
            return;
        }
        if (actorRole === user_role_enum_1.UserRole.MANAGER) {
            if ([user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.MANAGER].includes(targetRole)) {
                throw new common_1.ForbiddenException('Managers cannot modify or delete admin/manager accounts');
            }
            return;
        }
        throw new common_1.ForbiddenException('You are not allowed to manage this user');
    }
    buildDueDate(readingDate) {
        const dueDate = new Date(readingDate.getFullYear(), readingDate.getMonth() + 1, 10, 0, 0, 0, 0);
        return dueDate.toISOString().slice(0, 10);
    }
    getMonthLabel(year, month) {
        return `${this.getShortMonthLabel(month)} ${year}`;
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
    formatReadingDate(date) {
        const month = this.getShortMonthLabel(date.getMonth() + 1);
        return `${month} ${date.getDate()}`;
    }
    mapReadingStatusToUi(status) {
        if (status === reading_status_enum_1.ReadingStatus.VERIFIED) {
            return 'Submitted';
        }
        if (status === reading_status_enum_1.ReadingStatus.PENDING) {
            return 'Pending';
        }
        return 'Rejected';
    }
    roundToTwo(value) {
        return Number(value.toFixed(2));
    }
};
exports.ManagerService = ManagerService;
exports.ManagerService = ManagerService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(meter_entity_1.MeterEntity)),
    __param(4, (0, typeorm_1.InjectRepository)(meter_reading_entity_1.MeterReadingEntity)),
    __param(5, (0, typeorm_1.InjectRepository)(billing_setting_entity_1.BillingSettingEntity)),
    __param(6, (0, typeorm_1.InjectRepository)(bill_entity_1.BillEntity)),
    __metadata("design:paramtypes", [typeorm_2.DataSource,
        auth_service_1.AuthService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ManagerService);
//# sourceMappingURL=manager.service.js.map