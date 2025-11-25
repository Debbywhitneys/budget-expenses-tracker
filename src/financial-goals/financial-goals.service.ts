import { Injectable } from '@nestjs/common';
import { CreateFinancialGoalDto } from './dto/create-financial-goal.dto';
import { UpdateFinancialGoalDto } from './dto/update-financial-goal.dto';

@Injectable()
export class FinancialGoalsService {
  create(createFinancialGoalDto: CreateFinancialGoalDto) {
    return 'This action adds a new financialGoal';
  }

  findAll() {
    return `This action returns all financialGoals`;
  }

  findOne(id: number) {
    return `This action returns a #${id} financialGoal`;
  }

  update(id: number, updateFinancialGoalDto: UpdateFinancialGoalDto) {
    return `This action updates a #${id} financialGoal`;
  }

  remove(id: number) {
    return `This action removes a #${id} financialGoal`;
  }
}
