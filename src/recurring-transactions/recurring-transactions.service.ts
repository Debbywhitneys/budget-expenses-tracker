import { Injectable } from '@nestjs/common';
import { RecurringTransactionDto } from './dto/create-recurring-transaction.dto';
import { UpdateRecurringTransactionDto } from './dto/update-recurring-transaction.dto';

@Injectable()
export class RecurringTransactionsService {
  create(RecurringTransactionDto: RecurringTransactionDto) {
    return 'This action adds a new recurringTransaction';
  }

  findAll() {
    return `This action returns all recurringTransactions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} recurringTransaction`;
  }

  update(
    id: number,
    updateRecurringTransactionDto: UpdateRecurringTransactionDto,
  ) {
    return `This action updates a #${id} recurringTransaction`;
  }

  remove(id: number) {
    return `This action removes a #${id} recurringTransaction`;
  }
}
