import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecurringSplit } from '../expense-splits/entities/expense-split.entity';

@Injectable()
export class ExpenseSplitsService {
  private readonly logger = new Logger(ExpenseSplitsService.name);

  constructor(
    @InjectRepository(RecurringSplit)
    private readonly splitRepo: Repository<RecurringSplit>,
  ) {}

  // Get split details
  async findOne(id: number): Promise<RecurringSplit> {
    const split = await this.splitRepo.findOne({
      where: { id },
      relations: ['groupExpense', 'user'],
    });

    if (!split) {
      throw new NotFoundException(`Split ${id} not found`);
    }

    return split;
  }

  // Get all splits for an expense
  async findByExpense(groupExpenseId: number): Promise<RecurringSplit[]> {
    return this.splitRepo.find({
      where: { group_expense_id: groupExpenseId },
      relations: ['user'],
      order: { user_id: 'ASC' },
    });
  }

  // Get user's unsettled splits
  async findUnsettledByUser(userId: number): Promise<RecurringSplit[]> {
    return this.splitRepo.find({
      where: { user_id: userId, isSettled: false },
      relations: ['groupExpense', 'groupExpense.paidBy'],
      order: { createdAt: 'DESC' },
    });
  }

  // Mark split as settled
  async markAsSettled(id: number): Promise<RecurringSplit> {
    const split = await this.findOne(id);

    split.amountPaid = split.amountOwed;
    split.isSettled = true;
    split.settled_at = new Date();

    const savedSplit = await this.splitRepo.save(split);
    return Array.isArray(savedSplit) ? savedSplit[0] : savedSplit;
  }

  // Partial payment on split
  async makePartialPayment(
    id: number,
    amount: number,
  ): Promise<RecurringSplit> {
    const split = await this.findOne(id);

    const newAmountPaid = Number(split.amountPaid) + amount;

    if (newAmountPaid > Number(split.amountOwed)) {
      throw new BadRequestException('Payment exceeds amount owed');
    }

    split.amountPaid = newAmountPaid;

    if (newAmountPaid >= Number(split.amountOwed)) {
      split.isSettled = true;
      split.settled_at = new Date();
    }

    const savedSplit = await this.splitRepo.save(split);
    return Array.isArray(savedSplit) ? savedSplit[0] : savedSplit;
  }

  // Get balance summary for user
  async getUserBalance(userId: number): Promise<{
    total_owed: number;
    total_paid: number;
    remaining: number;
    splits: RecurringSplit[];
  }> {
    const splits = await this.findUnsettledByUser(userId);

    const totalOwed = splits.reduce((sum, s) => sum + Number(s.amountOwed), 0);
    const totalPaid = splits.reduce((sum, s) => sum + Number(s.amountPaid), 0);

    return {
      total_owed: totalOwed,
      total_paid: totalPaid,
      remaining: totalOwed - totalPaid,
      splits,
    };
  }
}
