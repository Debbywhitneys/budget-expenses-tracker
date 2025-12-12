import { Controller, Post, Get, Patch, Param, Body, Req } from '@nestjs/common';
import { RecurringTransactionsService } from './recurring-transactions.service';

@Controller('recurring-transactions')
export class RecurringTransactionsController {
  constructor(
    private readonly recurringService: RecurringTransactionsService,
  ) {}

  // ------------------------------
  // Create recurring transaction
  // ------------------------------
  @Post()
  async create(@Req() req, @Body() createDto: any) {
    const userId = req.user.user_id; // from JWT
    return this.recurringService.create(userId, createDto);
  }

  // ---------------------------------
  // Get all recurring for logged user
  // ---------------------------------
  @Get()
  async findAll(@Req() req) {
    const userId = req.user.user_id;
    return this.recurringService.findAll(userId);
  }

  // -------------------------------------
  // Get upcoming (next 30 days)
  // -------------------------------------
  @Get('upcoming')
  async upcoming(@Req() req) {
    const userId = req.user.user_id;
    return this.recurringService.getUpcoming(userId);
  }

  // -------------------------------------
  // Skip next occurrence for one recurring
  // -------------------------------------
  @Patch(':id/skip')
  async skip(@Req() req, @Param('id') id: number) {
    const userId = req.user.user_id;
    return this.recurringService.skipOccurrence(userId, id);
  }
}
