import { PartialType } from '@nestjs/mapped-types';
import { CreateFinancialGoalDto } from './create-financial-goal.dto';

export class UpdateFinancialGoalDto extends PartialType(
  CreateFinancialGoalDto,
) {}
