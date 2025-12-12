// ============================================
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { GroupExpensesService } from './groups-expenses.service';
import { AccessTokenGuard } from '../auth/guards/access-token.guards';
import { CreateGroupExpenseWithMembersDto } from './dto/create-groups-expense.dto';
import { UpdateGroupsExpenseDto } from './dto/update-groups-expense.dto';

@Controller('groups/:groupId/expenses')
@UseGuards(AccessTokenGuard)
export class GroupExpensesController {
  constructor(private readonly expensesService: GroupExpensesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Request() req,
    @Param('groupId', ParseIntPipe) groupId: number,
    @Body() createDto: CreateGroupExpenseWithMembersDto,
  ) {
    return this.expensesService.create(req.user.user_id, groupId, createDto);
  }

  @Get()
  findAllByGroup(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Query('start_date') start_date?: string,
    @Query('end_date') end_date?: string,
    @Query('is_settled') is_settled?: string,
  ) {
    return this.expensesService.findAllByGroup(groupId, {
      start_date: start_date ? new Date(start_date) : undefined,
      end_date: end_date ? new Date(end_date) : undefined,
      is_settled: is_settled ? is_settled === 'true' : undefined,
    });
  }

  @Get('export')
  exportToCSV(@Param('groupId', ParseIntPipe) groupId: number) {
    return this.expensesService.exportToCSV(groupId);
  }

  @Get('user/:userId')
  getUserExpenses(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.expensesService.getUserExpenses(userId, groupId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.expensesService.findOneWithSplits(id);
  }

  @Patch(':id')
  update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateGroupsExpenseDto,
  ) {
    return this.expensesService.update(req.user.user_id, id, updateDto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.expensesService.remove(req.user.user_id, id);
  }
}
