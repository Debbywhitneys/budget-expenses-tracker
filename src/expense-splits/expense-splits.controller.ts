import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { ExpenseSplitsService } from './expense-splits.service';
import { AccessTokenGuard } from '../auth/guards/access-token.guards';

@Controller('splits')
@UseGuards(AccessTokenGuard)
export class ExpenseSplitsController {
  constructor(private readonly splitsService: ExpenseSplitsService) {}

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.splitsService.findOne(id);
  }

  @Get('expense/:expenseId')
  findByExpense(@Param('expenseId', ParseIntPipe) expenseId: number) {
    return this.splitsService.findByExpense(expenseId);
  }

  @Get('user/:userId/unsettled')
  findUnsettledByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.splitsService.findUnsettledByUser(userId);
  }

  @Get('user/:userId/balance')
  getUserBalance(@Param('userId', ParseIntPipe) userId: number) {
    return this.splitsService.getUserBalance(userId);
  }

  @Patch(':id/settle')
  markAsSettled(@Param('id', ParseIntPipe) id: number) {
    return this.splitsService.markAsSettled(id);
  }

  @Patch(':id/partial-payment')
  makePartialPayment(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { amount: number },
  ) {
    return this.splitsService.makePartialPayment(id, body.amount);
  }
}
