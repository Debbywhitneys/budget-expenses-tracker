import { Injectable } from '@nestjs/common';
import { CreateRecurringSplitDto } from './dto/create-expense-split.dto';
import { UpdateExpenseSplitDto } from './dto/update-expense-split.dto';

@Injectable()
export class ExpenseSplitsService {
  create(CreateRecurringSplitDto: CreateRecurringSplitDto) {
    return 'This action adds a new expenseSplit';
  }

  findAll() {
    return `This action returns all expenseSplits`;
  }

  findOne(id: number) {
    return `This action returns a #${id} expenseSplit`;
  }

  update(id: number, updateExpenseSplitDto: UpdateExpenseSplitDto) {
    return `This action updates a #${id} expenseSplit`;
  }

  remove(id: number) {
    return `This action removes a #${id} expenseSplit`;
  }
}
