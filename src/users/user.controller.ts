import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { DashboardQueryDto } from './dto/dashboard-query.dto';
import { PayCurrentBillDto } from './dto/pay-current-bill.dto';
import { StatementParamsDto } from './dto/statement-params.dto';
import { UserEntity } from './entity/user.entity';

@Controller('users')
export class UserController {
  constructor(private readonly usersService: UserService) {}

  @Get(':id/dashboard')
  getUserDashboard(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query() query: DashboardQueryDto,
  ) {
    return this.usersService.getDashboard(id, query);
  }
  @Get('all')
    getAllUsers(): Promise<{ users: UserEntity[]; total: number }> {
        return this.usersService.getUser().then(([users, total]) => ({ users, total }));
    }

  @Get(':id/payment-history')
  getUserPaymentHistory(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query() query: DashboardQueryDto,
  ) {
    const limit = query.historyLimit ?? 10;
    return this.usersService.getPaymentHistory(id, limit);
  }

  @Get(':id/usage-history')
  getUserUsageHistory(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query() query: DashboardQueryDto,
  ) {
    return this.usersService.getUsageHistory(id, query);
  }

  @Post(':id/bills/current/pay')
  payCurrentBill(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: PayCurrentBillDto,
  ) {
    return this.usersService.payCurrentBill(id, dto);
  }

  @Get(':id/statements/:year/:month')
  getStatement(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param() params: StatementParamsDto,
  ) {
    return this.usersService.getStatement(id, params);
  }
}