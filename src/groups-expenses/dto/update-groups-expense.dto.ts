import { PartialType } from '@nestjs/mapped-types';
import { CreateGroupExpenseDto } from './create-groups-expense.dto';

export class UpdateGroupsExpenseDto extends PartialType(
  CreateGroupExpenseDto,
) {}
