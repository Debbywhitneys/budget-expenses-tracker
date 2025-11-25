import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ExpenseSplitsService } from './expense-splits.service';
import { CreateRecurringSplitDto } from './dto/create-expense-split.dto';
import { UpdateExpenseSplitDto } from './dto/update-expense-split.dto';

@Controller('expense-splits')
export class ExpenseSplitsController {
  constructor(private readonly expenseSplitsService: ExpenseSplitsService) {}

  @Post()
  create(@Body() CreateRecurringSplitDto: CreateRecurringSplitDto) {
    return this.expenseSplitsService.create(CreateRecurringSplitDto);
  }

  @Get()
  findAll() {
    return this.expenseSplitsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.expenseSplitsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateExpenseSplitDto: UpdateExpenseSplitDto,
  ) {
    return this.expenseSplitsService.update(+id, updateExpenseSplitDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.expenseSplitsService.remove(+id);
  }
}
