"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const admin_entity_1 = require("./entity/admin.entity");
const typeorm_2 = require("typeorm");
const bcrypt = __importStar(require("bcrypt"));
let AdminService = class AdminService {
    adminRepository;
    constructor(adminRepository) {
        this.adminRepository = adminRepository;
    }
    async createAdmin(data) {
        await this.ensureUniqueFields(data.email, data.username);
        const hashPassword = await this.hasahPassword(data.password);
        const admin = this.adminRepository.create({ ...data, password: hashPassword });
        const savedAdmin = await this.adminRepository.save(admin);
        return {
            message: 'Admin created successfully',
            data: {
                id: savedAdmin.id,
                username: savedAdmin.username,
                name: savedAdmin.fullName,
                email: savedAdmin.email,
                createdAt: savedAdmin.createdAt,
                phone: savedAdmin.phone,
                status: savedAdmin.status,
            },
        };
    }
    async hasahPassword(password) {
        return await bcrypt.hash(password, 10);
    }
    async ensureUniqueFields(email, username) {
        const existingAdmin = await this.adminRepository.findOne({
            where: [{ email }, { username }],
        });
        if (existingAdmin) {
            throw new Error('Email or username already exists');
        }
    }
    async getAdmin(id) {
        const admin = await this.adminRepository.findOne({ where: { id } });
        if (!admin) {
            throw new Error('Admin not found');
        }
        return {
            message: 'Admin retrieved successfully',
            data: {
                id: admin.id,
                username: admin.username,
                name: admin.fullName,
                email: admin.email,
                status: admin.status,
            },
        };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(admin_entity_1.AdminEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AdminService);
//# sourceMappingURL=admin.service.js.map