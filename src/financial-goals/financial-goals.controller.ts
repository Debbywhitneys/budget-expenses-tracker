import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { FinancialGoalsService } from './financial-goals.service';
import { CreateFinancialGoalDto } from './dto/create-financial-goal.dto';
import { UpdateFinancialGoalDto } from './dto/update-financial-goal.dto';

@Controller('financial-goals')
export class FinancialGoalsController {
  constructor(private readonly financialGoalsService: FinancialGoalsService) {}

  @Post()
  create(@Body() createFinancialGoalDto: CreateFinancialGoalDto) {
    return this.financialGoalsService.create(createFinancialGoalDto);
  }

  @Get()
  findAll() {
    return this.financialGoalsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.financialGoalsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFinancialGoalDto: UpdateFinancialGoalDto,
  ) {
    return this.financialGoalsService.update(+id, updateFinancialGoalDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.financialGoalsService.remove(+id);
  }
}
