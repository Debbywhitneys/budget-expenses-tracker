import { Controller, Get, Query, Param, ParseIntPipe, Post, Body } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Controller('analytics')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  // ============================================
  // CREATE TRANSACTION
  // ============================================
  @Post()
  async createTransaction(@Body() createDto: CreateTransactionDto) {
    return this.transactionsService.create(createDto.user_id, createDto);
  }

  // ============================================
  // SPENDING BY CATEGORY
  // ============================================
  @Get('spending-by-category')
  getSpendingByCategory(
    @Query('userId', ParseIntPipe) userId: number,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.transactionsService.getSpendingByCategory(
      userId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  // ============================================
  // INCOME VS EXPENSE TRENDS
  // ============================================
  @Get('income-expense-trends')
  getIncomeExpenseTrends(
    @Query('userId', ParseIntPipe) userId: number,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('groupBy') groupBy: 'day' | 'week' | 'month' = 'month',
  ) {
    return this.transactionsService.getIncomeExpenseTrends(
      userId,
      new Date(startDate),
      new Date(endDate),
      groupBy,
    );
  }

  // ============================================
  // MONTHLY COMPARISON
  // ============================================
  @Get('monthly-comparison/:userId/:year')
  getMonthlyComparison(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('year', ParseIntPipe) year: number,
  ) {
    return this.transactionsService.getMonthlyComparison(userId, year);
  }

  // ============================================
  // CASH FLOW ANALYSIS
  // ============================================
  @Get('cash-flow')
  getCashFlowAnalysis(
    @Query('userId', ParseIntPipe) userId: number,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.transactionsService.getCashFlowAnalysis(
      userId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  // ============================================
  // NET WORTH
  // ============================================
  @Get('net-worth/:userId')
  getNetWorth(@Param('userId', ParseIntPipe) userId: number) {
    return this.transactionsService.getNetWorth(userId);
  }

  // ============================================
  // DASHBOARD SUMMARY
  // ============================================
  @Get('dashboard-summary/:userId')
  getDashboardSummary(@Param('userId', ParseIntPipe) userId: number) {
    return this.transactionsService.getDashboardSummary(userId);
  }

  // ============================================
  // BASIC TRANSACTION LISTING
  // ============================================
  @Get('list')
  async getTransactions(
    @Query('userId', ParseIntPipe) userId: number,
    @Query('sort') sort: 'asc' | 'desc' = 'desc',
    @Query('limit') limit = 10,
    @Query('since') since?: string,
    @Query('fromId') fromId?: number,
  ) {
    return this.transactionsService.getAllTransactions(
      userId,
      sort,
      limit,
      since,
      fromId,
    );
  }
}
