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
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const user_service_1 = require("./user.service");
const dashboard_query_dto_1 = require("./dto/dashboard-query.dto");
const pay_current_bill_dto_1 = require("./dto/pay-current-bill.dto");
const statement_params_dto_1 = require("./dto/statement-params.dto");
let UserController = class UserController {
    usersService;
    constructor(usersService) {
        this.usersService = usersService;
    }
    getUserDashboard(id, query) {
        return this.usersService.getDashboard(id, query);
    }
    getAllUsers() {
        return this.usersService.getUser().then(([users, total]) => ({ users, total }));
    }
    getUserPaymentHistory(id, query) {
        const limit = query.historyLimit ?? 10;
        return this.usersService.getPaymentHistory(id, limit);
    }
    getUserUsageHistory(id, query) {
        return this.usersService.getUsageHistory(id, query);
    }
    payCurrentBill(id, dto) {
        return this.usersService.payCurrentBill(id, dto);
    }
    getStatement(id, params) {
        return this.usersService.getStatement(id, params);
    }
};
exports.UserController = UserController;
__decorate([
    (0, common_1.Get)(':id/dashboard'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dashboard_query_dto_1.DashboardQueryDto]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "getUserDashboard", null);
__decorate([
    (0, common_1.Get)('all'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getAllUsers", null);
__decorate([
    (0, common_1.Get)(':id/payment-history'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dashboard_query_dto_1.DashboardQueryDto]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "getUserPaymentHistory", null);
__decorate([
    (0, common_1.Get)(':id/usage-history'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dashboard_query_dto_1.DashboardQueryDto]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "getUserUsageHistory", null);
__decorate([
    (0, common_1.Post)(':id/bills/current/pay'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pay_current_bill_dto_1.PayCurrentBillDto]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "payCurrentBill", null);
__decorate([
    (0, common_1.Get)(':id/statements/:year/:month'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, statement_params_dto_1.StatementParamsDto]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "getStatement", null);
exports.UserController = UserController = __decorate([
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [user_service_1.UserService])
], UserController);
//# sourceMappingURL=user.controller.js.map