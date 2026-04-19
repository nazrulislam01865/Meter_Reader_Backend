import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { UserRole } from '../common/enums/user-role.enum';
import { ManagerService } from './manager.service';
import { CreateManagedUserDto } from './dto/create-managed-user.dto';
import { CreateManualReadingDto } from './dto/create-manual-reading.dto';
import { ManagerUsersQueryDto } from './dto/manager-users-query.dto';
import { ReadingsQueryDto } from './dto/readings-query.dto';
import { UpdateManagedUserDto } from './dto/update-managed-user.dto';
import { UpdateUnitPriceDto } from './dto/update-unit-price.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.MANAGER, UserRole.ADMIN)
@Controller('managers')
export class ManagerController {
  constructor(private readonly managerService: ManagerService) {}

  @Get('dashboard/summary')
  getDashboardSummary() {
    return this.managerService.getDashboardSummary();
  }

  @Post('users')
  createManagedUser(
    @CurrentUser() actor: AuthenticatedUser,
    @Body() dto: CreateManagedUserDto,
  ) {
    return this.managerService.createManagedUser(actor, dto);
  }

  @Get('users')
  listManagedUsers(@Query() query: ManagerUsersQueryDto) {
    return this.managerService.listManagedUsers(query);
  }

  @Get('users/:id')
  getManagedUser(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.managerService.getManagedUserById(id);
  }

  @Patch('users/:id')
  updateManagedUser(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateManagedUserDto,
  ) {
    return this.managerService.updateManagedUser(actor, id, dto);
  }

  @Delete('users/:id')
  deleteManagedUser(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.managerService.deleteManagedUser(actor, id);
  }

  @Post('readings/manual')
  submitManualReading(
    @CurrentUser() actor: AuthenticatedUser,
    @Body() dto: CreateManualReadingDto,
  ) {
    return this.managerService.submitManualReading(actor, dto);
  }

  @Get('readings')
  getAllReadings(@Query() query: ReadingsQueryDto) {
    return this.managerService.getAllReadings(query);
  }

  @Get('billing/unit-price')
  getCurrentUnitPrice() {
    return this.managerService.getCurrentUnitPrice();
  }

  @Patch('billing/unit-price')
  updateUnitPrice(@Body() dto: UpdateUnitPriceDto) {
    return this.managerService.updateUnitPrice(dto);
  }
}