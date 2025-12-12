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
import {
  BudgetsService,
  BudgetWithSpending,
  BudgetVsActualReport,
} from './budgets.service';
import { AccessTokenGuard } from '../auth/guards/access-token.guards';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';

@Controller('budgets')
@UseGuards(AccessTokenGuard)
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Request() req, @Body() createDto: CreateBudgetDto) {
    return this.budgetsService.create(req.user.user_id, createDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.budgetsService.findAll(req.user.user_id);
  }

  @Get('vs-actual')
  getBudgetVsActual(
    @Request() req,
    @Query('start_date') start_date: string,
    @Query('end_date') end_date: string,
  ) {
    return this.budgetsService.getBudgetVsActual(
      req.user.user_id,
      new Date(start_date),
      new Date(end_date),
    );
  }

  @Post('rollover')
  rolloverBudgets(@Request() req) {
    return this.budgetsService.rolloverBudgets(req.user.user_id);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.budgetsService.findOne(req.user.user_id, id);
  }

  @Patch(':id')
  update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateBudgetDto,
  ) {
    return this.budgetsService.update(req.user.user_id, id, updateDto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.budgetsService.remove(req.user.user_id, id);
  }
}
