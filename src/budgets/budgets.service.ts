import {
  Injectable,
  BadRequestException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Budget, BudgetType } from './entities/budget.entity';
import {
  Transaction,
  TransactionType,
} from '../transactions/entities/transaction.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';

// Type for budget with computed spending
export interface BudgetWithSpending extends Budget {
  spent: number;
  spentPercentage: number;
}

// Type for budget vs actual report
export interface BudgetVsActualReport {
  category: string | undefined;
  budgeted: number;
  spent: number;
  remaining: number;
  percentage: number;
}

@Injectable()
export class BudgetsService {
  private readonly logger = new Logger(BudgetsService.name);

  constructor(
    @InjectRepository(Budget)
    private readonly budgetRepo: Repository<Budget>,
    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,
    private readonly notificationsService: NotificationsService,
  ) {}

  // ---------------------------------------------------
  // CREATE BUDGET
  // ---------------------------------------------------
  async create(userId: number, createDto: CreateBudgetDto): Promise<Budget> {
    const existing = await this.budgetRepo.findOne({
      where: {
        user_id: userId,
        category_id: createDto.category_id,
        period: createDto.period,
        isActive: true,
      },
    });

    if (existing) {
      throw new BadRequestException(
        'Budget already exists for this category and period',
      );
    }

    const budget = this.budgetRepo.create({
      ...createDto,
      user_id: userId,
    });

    const savedBudget = await this.budgetRepo.save(budget);
    return Array.isArray(savedBudget) ? savedBudget[0] : savedBudget;
  }

  // ---------------------------------------------------
  // GET ALL BUDGETS + COMPUTED SPENDING (not saved)
  // ---------------------------------------------------
  async findAll(userId: number): Promise<BudgetWithSpending[]> {
    const budgets = await this.budgetRepo.find({
      where: { user_id: userId, isActive: true },
      relations: ['category'],
      order: { createdAt: 'DESC' },
    });

    const results: BudgetWithSpending[] = [];

    for (const budget of budgets) {
      const spent = await this.calculateSpending(
        userId,
        budget.category_id,
        new Date(budget.startDate),
        new Date(budget.endDate),
      );

      const spentPercentage = (Number(spent) / Number(budget.amount)) * 100;

      // Trigger notification but DO NOT save spent
      await this.checkBudgetAlert({
        ...budget,
        spent,
      });

      results.push({
        ...budget,
        spent,
        spentPercentage,
      });
    }

    return results;
  }

  // ---------------------------------------------------
  // SPENDING CALCULATION
  // ---------------------------------------------------
  private async calculateSpending(
    userId: number,
    categoryId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    if (!categoryId) return 0;

    const transactions = await this.transactionRepo.find({
      where: {
        user_id: userId,
        category_id: categoryId,
        type: TransactionType.expense,
        startDate: Between(startDate, endDate),
      },
    });

    return transactions.reduce((sum, t) => sum + Number(t.amount), 0);
  }

  // ---------------------------------------------------
  // BUDGET ALERT CHECK
  // ---------------------------------------------------
  private async checkBudgetAlert(
    budgetWithSpent: Budget & { spent: number },
  ): Promise<void> {
    if (!budgetWithSpent.alertThreshold) return;

    const spentPercentage =
      (Number(budgetWithSpent.spent) / Number(budgetWithSpent.amount)) * 100;

    if (spentPercentage >= budgetWithSpent.alertThreshold) {
      await this.notificationsService.create({
        user_id: budgetWithSpent.user_id,
        type: NotificationType.budget_alert,
        title: 'Budget Alert',
        message: `You've spent ${spentPercentage.toFixed(0)}% of your ${budgetWithSpent.category?.name ?? 'budget'}`,
        action_url: `/budgets/${budgetWithSpent.id}`,
      });
    }
  }

  // ---------------------------------------------------
  // BUDGET VS ACTUAL REPORT
  // ---------------------------------------------------
  async getBudgetVsActual(
    userId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<BudgetVsActualReport[]> {
    const budgets = await this.budgetRepo.find({
      where: { user_id: userId, isActive: true },
      relations: ['category'],
    });

    const report: BudgetVsActualReport[] = [];

    for (const budget of budgets) {
      const spent = await this.calculateSpending(
        userId,
        budget.category_id,
        startDate,
        endDate,
      );

      report.push({
        category: budget.category?.name,
        budgeted: Number(budget.amount),
        spent,
        remaining: Number(budget.amount) - spent,
        percentage: (spent / Number(budget.amount)) * 100,
      });
    }

    return report;
  }

  // ---------------------------------------------------
  // ROLLOVER UNUSED BUDGET
  // ---------------------------------------------------
  async findOne(userId: number, id: number): Promise<Budget> {
    const budget = await this.budgetRepo.findOne({
      where: { id, user_id: userId },
    });

    if (!budget) {
      throw new NotFoundException(`Budget ${id} not found`);
    }

    return budget;
  }

  // ---------------------------------------------------
  async update(
    userId: number,
    id: number,
    updateDto: UpdateBudgetDto,
  ): Promise<Budget> {
    const budget = await this.findOne(userId, id);
    Object.assign(budget, updateDto);
    const savedBudget = await this.budgetRepo.save(budget);
    return Array.isArray(savedBudget) ? savedBudget[0] : savedBudget;
  }

  // ---------------------------------------------------
  async remove(userId: number, id: number): Promise<{ message: string }> {
    const budget = await this.findOne(userId, id);
    await this.budgetRepo.remove(budget);
    return { message: `Budget ${id} deleted successfully` };
  }

  // ---------------------------------------------------
  async rolloverBudgets(userId: number): Promise<void> {
    const budgets = await this.budgetRepo.find({
      where: { user_id: userId, isActive: true },
    });

    for (const budget of budgets) {
      const today = new Date();
      const endDate = new Date(budget.endDate);

      if (endDate < today) {
        const spent = await this.calculateSpending(
          userId,
          budget.category_id,
          new Date(budget.startDate),
          new Date(budget.endDate),
        );

        const remaining = Number(budget.amount) - spent;

        if (remaining > 0) {
          const newStartDate = new Date(endDate);
          newStartDate.setDate(newStartDate.getDate() + 1);

          const newEndDate = this.calculateEndDate(newStartDate, budget.period);

          await this.budgetRepo.save({
            user_id: userId,
            category_id: budget.category_id,
            amount: remaining,
            period: budget.period,
            startDate: newStartDate,
            endDate: newEndDate,
            alertThreshold: budget.alertThreshold,
            isActive: true,
          });
        }

        budget.isActive = false;
        await this.budgetRepo.save(budget);
      }
    }
  }

  private calculateEndDate(startDate: Date, period: BudgetType): Date {
    const endDate = new Date(startDate);

    switch (period) {
      case BudgetType.weekly:
        endDate.setDate(endDate.getDate() + 7);
        break;

      case BudgetType.monthly:
        endDate.setMonth(endDate.getMonth() + 1);
        break;

      case BudgetType.yearly:
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
    }

    return endDate;
  }
}
