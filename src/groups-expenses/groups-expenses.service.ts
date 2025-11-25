import { Injectable } from '@nestjs/common';
import { CreateGroupExpenseDto } from './dto/create-groups-expense.dto';
import { UpdateGroupsExpenseDto } from './dto/update-groups-expense.dto';

@Injectable()
export class GroupsExpensesService {
  create(createGroupExpenseDto: CreateGroupExpenseDto) {
    return 'This action adds a new groupsExpense';
  }

  findAll() {
    return `This action returns all groupsExpenses`;
  }

  findOne(id: number) {
    return `This action returns a #${id} groupsExpense`;
  }

  update(id: number, updateGroupExpenseDto: UpdateGroupsExpenseDto) {
    return `This action updates a #${id} groupsExpense`;
  }

  remove(id: number) {
    return `This action removes a #${id} groupsExpense`;
  }
}
