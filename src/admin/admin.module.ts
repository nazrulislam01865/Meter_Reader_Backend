import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AdminService } from "./admin.service";
import { AdminEntity } from "./entity/admin.entity";
import { AdminController } from "./admin.controller";

@Module({
    imports: [TypeOrmModule.forFeature([AdminEntity ])],
    controllers: [AdminController],
    providers: [AdminService],
})
export class AdminModule { }