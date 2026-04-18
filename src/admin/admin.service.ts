import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AdminEntity } from "./entity/admin.entity";
import { Repository } from "typeorm";
import { CreateAdminDto } from "./dto/admin.dto";
import * as bcrypt from "bcrypt";

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(AdminEntity)
        private readonly adminRepository: Repository<AdminEntity>,
    ) { } 

    async createAdmin(data: CreateAdminDto) {
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

    private async hasahPassword(password: string): Promise<string> {
        return await bcrypt.hash(password, 10);
    }

    private async ensureUniqueFields(email: string, username: string): Promise<void> {
        const existingAdmin = await this.adminRepository.findOne({
            where: [{ email }, { username }],
        });
        if (existingAdmin) {
            throw new Error('Email or username already exists');
        }
    }

    async getAdmin(id: number){
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
    
}