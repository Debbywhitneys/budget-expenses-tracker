import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import {
  RecurringTransaction,
  frequency as RecurrenceFrequency,
} from './entities/recurring-transaction.entity';
import { TransactionType } from '../transactions/entities/transaction.entity';
import { CreateRecurringTransactionDto } from './dto/create-recurring-transaction.dto';
import { TransactionsService } from '../transactions/transactions.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class RecurringTransactionsService {
  private readonly logger = new Logger(RecurringTransactionsService.name);

  constructor(
    @InjectRepository(RecurringTransaction)
    private readonly recurringRepo: Repository<RecurringTransaction>,
    private readonly transactionService: TransactionsService,
  ) {}

  // Create recurring transaction
  async create(
    userId: number,
    createDto: CreateRecurringTransactionDto,
  ): Promise<RecurringTransaction> {
    const recurring = this.recurringRepo.create({
      ...createDto,
      user_id: userId,
    });

    return this.recurringRepo.save(recurring);
  }

  // Get all recurring transactions
  async findAll(userId: number): Promise<RecurringTransaction[]> {
    return this.recurringRepo.find({
      where: { user_id: userId, isActive: true },
      relations: ['account', 'category'],
      order: { nextOccurrenceDate: 'ASC' },
    });
  }

  // Get upcoming recurring transactions (next 30 days)
  async getUpcoming(userId: number): Promise<RecurringTransaction[]> {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    return this.recurringRepo.find({
      where: {
        user_id: userId,
        isActive: true,
        nextOccurrenceDate: LessThanOrEqual(thirtyDaysFromNow),
      },
      relations: ['account', 'category'],
      order: { nextOccurrenceDate: 'ASC' },
    });
  }

  // Process recurring transactions (run daily)
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async processRecurringTransactions(): Promise<void> {
    this.logger.log('Processing recurring transactions...');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueRecurring = await this.recurringRepo.find({
      where: {
        isActive: true,
        nextOccurrenceDate: LessThanOrEqual(today),
      },
      relations: ['account', 'category'],
    });

    for (const recurring of dueRecurring) {
      try {
        await this.transactionService.create(recurring.user_id, {
          user_id: recurring.user_id,
          account_id: recurring.account_id,
          category_id: recurring.category_id,
          type: recurring.type as unknown as TransactionType,
          amount: recurring.amount,
          startDate: recurring.nextOccurrenceDate,
          description: recurring.description,
        });

        // Update next occurrence
        recurring.nextOccurrenceDate = this.calculateNextOccurrence(
          recurring.nextOccurrenceDate,
          recurring.frequency,
        );

        // Auto-deactivate if endDate passed
        if (
          recurring.endDate &&
          recurring.nextOccurrenceDate > recurring.endDate
        ) {
          recurring.isActive = false;
        }

        await this.recurringRepo.save(recurring);

        this.logger.log(`Created transaction for recurring ${recurring.id}`);
      } catch (error: unknown) {
        this.logger.error(
          `Failed to process recurring ${recurring.id}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }
  }

  private calculateNextOccurrence(
    currentDate: Date,
    frequency: RecurrenceFrequency,
  ): Date {
    const nextDate = new Date(currentDate);

    switch (frequency) {
      case RecurrenceFrequency.daily:
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case RecurrenceFrequency.weekly:
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case RecurrenceFrequency.monthly:
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case RecurrenceFrequency.yearly:
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
    }

    return nextDate;
  }

  // Skip next occurrence
  async skipOccurrence(
    userId: number,
    id: number,
  ): Promise<RecurringTransaction> {
    const recurring = await this.recurringRepo.findOne({
      where: { id, user_id: userId },
    });

    if (!recurring) {
      throw new NotFoundException(`Recurring transaction ${id} not found`);
    }

    recurring.nextOccurrenceDate = this.calculateNextOccurrence(
      recurring.nextOccurrenceDate,
      recurring.frequency,
    );

    return this.recurringRepo.save(recurring);
  }
}
