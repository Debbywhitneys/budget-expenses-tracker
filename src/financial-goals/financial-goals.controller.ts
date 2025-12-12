import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { FinancialGoalsService } from './financial-goals.service';
import { AccessTokenGuard } from '../auth/guards/access-token.guards';
import { CreateFinancialGoalDto } from './dto/create-financial-goal.dto';
import { UpdateFinancialGoalDto } from './dto/update-financial-goal.dto';

@Controller('financial-goals')
@UseGuards(AccessTokenGuard)
export class FinancialGoalsController {
  constructor(private readonly goalsService: FinancialGoalsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Request() req, @Body() createDto: CreateFinancialGoalDto) {
    return this.goalsService.create(req.user.user_id, createDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.goalsService.findAll(req.user.user_id);
  }

  @Get('statistics')
  getStatistics(@Request() req) {
    return this.goalsService.getStatistics(req.user.user_id);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.goalsService.findOne(req.user.user_id, id);
  }

  @Patch(':id')
  update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateFinancialGoalDto,
  ) {
    return this.goalsService.update(req.user.user_id, id, updateDto);
  }

  @Patch(':id/allocate')
  allocateToGoal(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { amount: number },
  ) {
    return this.goalsService.allocateToGoal(req.user.user_id, id, body.amount);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.goalsService.remove(req.user.user_id, id);
  }
}
