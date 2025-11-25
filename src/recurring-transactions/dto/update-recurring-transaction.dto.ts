import { PartialType } from '@nestjs/mapped-types';
import { RecurringTransactionDto } from './create-recurring-transaction.dto';

export class UpdateRecurringTransactionDto extends PartialType(
  RecurringTransactionDto,
) {}
