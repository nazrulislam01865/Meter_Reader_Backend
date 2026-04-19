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
exports.ManagerController = void 0;
const common_1 = require("@nestjs/common");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const user_role_enum_1 = require("../common/enums/user-role.enum");
const manager_service_1 = require("./manager.service");
const create_managed_user_dto_1 = require("./dto/create-managed-user.dto");
const create_manual_reading_dto_1 = require("./dto/create-manual-reading.dto");
const manager_users_query_dto_1 = require("./dto/manager-users-query.dto");
const readings_query_dto_1 = require("./dto/readings-query.dto");
const update_managed_user_dto_1 = require("./dto/update-managed-user.dto");
const update_unit_price_dto_1 = require("./dto/update-unit-price.dto");
let ManagerController = class ManagerController {
    managerService;
    constructor(managerService) {
        this.managerService = managerService;
    }
    getDashboardSummary() {
        return this.managerService.getDashboardSummary();
    }
    createManagedUser(actor, dto) {
        return this.managerService.createManagedUser(actor, dto);
    }
    listManagedUsers(query) {
        return this.managerService.listManagedUsers(query);
    }
    getManagedUser(id) {
        return this.managerService.getManagedUserById(id);
    }
    updateManagedUser(actor, id, dto) {
        return this.managerService.updateManagedUser(actor, id, dto);
    }
    deleteManagedUser(actor, id) {
        return this.managerService.deleteManagedUser(actor, id);
    }
    submitManualReading(actor, dto) {
        return this.managerService.submitManualReading(actor, dto);
    }
    getAllReadings(query) {
        return this.managerService.getAllReadings(query);
    }
    getCurrentUnitPrice() {
        return this.managerService.getCurrentUnitPrice();
    }
    updateUnitPrice(dto) {
        return this.managerService.updateUnitPrice(dto);
    }
};
exports.ManagerController = ManagerController;
__decorate([
    (0, common_1.Get)('dashboard/summary'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ManagerController.prototype, "getDashboardSummary", null);
__decorate([
    (0, common_1.Post)('users'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_managed_user_dto_1.CreateManagedUserDto]),
    __metadata("design:returntype", void 0)
], ManagerController.prototype, "createManagedUser", null);
__decorate([
    (0, common_1.Get)('users'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [manager_users_query_dto_1.ManagerUsersQueryDto]),
    __metadata("design:returntype", void 0)
], ManagerController.prototype, "listManagedUsers", null);
__decorate([
    (0, common_1.Get)('users/:id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ManagerController.prototype, "getManagedUser", null);
__decorate([
    (0, common_1.Patch)('users/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_managed_user_dto_1.UpdateManagedUserDto]),
    __metadata("design:returntype", void 0)
], ManagerController.prototype, "updateManagedUser", null);
__decorate([
    (0, common_1.Delete)('users/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ManagerController.prototype, "deleteManagedUser", null);
__decorate([
    (0, common_1.Post)('readings/manual'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_manual_reading_dto_1.CreateManualReadingDto]),
    __metadata("design:returntype", void 0)
], ManagerController.prototype, "submitManualReading", null);
__decorate([
    (0, common_1.Get)('readings'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [readings_query_dto_1.ReadingsQueryDto]),
    __metadata("design:returntype", void 0)
], ManagerController.prototype, "getAllReadings", null);
__decorate([
    (0, common_1.Get)('billing/unit-price'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ManagerController.prototype, "getCurrentUnitPrice", null);
__decorate([
    (0, common_1.Patch)('billing/unit-price'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_unit_price_dto_1.UpdateUnitPriceDto]),
    __metadata("design:returntype", void 0)
], ManagerController.prototype, "updateUnitPrice", null);
exports.ManagerController = ManagerController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.MANAGER, user_role_enum_1.UserRole.ADMIN),
    (0, common_1.Controller)('managers'),
    __metadata("design:paramtypes", [manager_service_1.ManagerService])
], ManagerController);
//# sourceMappingURL=manager.controller.js.map