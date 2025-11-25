import { PartialType } from '@nestjs/mapped-types';
import { CreateRecurringSplitDto } from './create-expense-split.dto';

export class UpdateExpenseSplitDto extends PartialType(
  CreateRecurringSplitDto,
) {}
