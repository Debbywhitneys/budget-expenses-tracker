import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan, LessThan } from 'typeorm';
import {
  Transaction,
  TransactionType,
} from '../transactions/entities/transaction.entity';
import { Account, AccountType } from '../accounts/entities/account.entity';
import { Budget } from '../budgets/entities/budget.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);

  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,
    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,
    @InjectRepository(Budget)
    private readonly budgetRepo: Repository<Budget>,
  ) {}

  // Create transaction
  async create(
    userId: number,
    createDto: CreateTransactionDto,
  ): Promise<Transaction> {
    const transactionData = {
      user_id: userId,
      account_id: createDto.account_id,
      category_id: createDto.category_id,
      type: createDto.type,
      amount: createDto.amount,
      startDate: createDto.startDate || new Date(),
      description: createDto.description,
    };

    const transaction = this.transactionRepo.create(transactionData);
    const savedTransaction = await this.transactionRepo.save(transaction);

    if (Array.isArray(savedTransaction)) {
      return savedTransaction[0] as Transaction;
    }
    return savedTransaction;
  }

  // ============================================
  // SPENDING BY CATEGORY
  // ============================================
  async getSpendingByCategory(userId: number, startDate: Date, endDate: Date) {
    const transactions = await this.transactionRepo.find({
      where: {
        user_id: userId,
        type: TransactionType.expense,
        startDate: Between(startDate, endDate),
      },
      relations: ['category'],
    });

    const categoryMap = new Map<string, { amount: number; color: string }>();

    let totalExpenses = 0;

    transactions.forEach((t) => {
      const categoryName = t.category?.name || 'Uncategorized';
      const categoryColor = t.category?.color || '#9E9E9E';
      const amount = Number(t.amount);

      const existing = categoryMap.get(categoryName) || {
        amount: 0,
        color: categoryColor,
      };

      categoryMap.set(categoryName, {
        amount: existing.amount + amount,
        color: categoryColor,
      });

      totalExpenses += amount;
    });

    return Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        amount: data.amount,
        percentage: (data.amount / totalExpenses) * 100,
        color: data.color,
      }))
      .sort((a, b) => b.amount - a.amount);
  }

  // ============================================
  // INCOME VS EXPENSE TRENDS
  // ============================================
  async getIncomeExpenseTrends(
    userId: number,
    startDate: Date,
    endDate: Date,
    groupBy: 'day' | 'week' | 'month' = 'month',
  ) {
    const transactions = await this.transactionRepo.find({
      where: {
        user_id: userId,
        startDate: Between(startDate, endDate),
      },
      order: { startDate: 'ASC' },
    });

    const grouped = new Map<string, { income: number; expense: number }>();

    transactions.forEach((t) => {
      const dateKey = this.getDateKey(new Date(t.startDate), groupBy);
      const existing = grouped.get(dateKey) || {
        income: 0,
        expense: 0,
      };

      if (t.type === TransactionType.income)
        existing.income += Number(t.amount);

      if (t.type === TransactionType.expense)
        existing.expense += Number(t.amount);

      grouped.set(dateKey, existing);
    });

    return Array.from(grouped.entries())
      .map(([date, data]) => ({
        date,
        income: data.income,
        expense: data.expense,
        net: data.income - data.expense,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  // ============================================
  // MONTHLY COMPARISON
  // ============================================
  async getMonthlyComparison(userId: number, year: number) {
    const months: Array<{
      month: string;
      income: number;
      expense: number;
      net: number;
      savings_rate: number;
    }> = [];

    for (let month = 0; month < 12; month++) {
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);

      const transactions = await this.transactionRepo.find({
        where: {
          user_id: userId,
          startDate: Between(startDate, endDate),
        },
      });

      const income = transactions
        .filter((t) => t.type === TransactionType.income)
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const expense = transactions
        .filter((t) => t.type === TransactionType.expense)
        .reduce((sum, t) => sum + Number(t.amount), 0);

      months.push({
        month: startDate.toLocaleString('default', { month: 'long' }),
        income,
        expense,
        net: income - expense,
        savings_rate: income > 0 ? ((income - expense) / income) * 100 : 0,
      });
    }

    return months;
  }

  // ============================================
  // CASH FLOW ANALYSIS
  // ============================================
  async getCashFlowAnalysis(userId: number, startDate: Date, endDate: Date) {
    const accounts = await this.accountRepo.find({
      where: { user_id: userId, isActive: true },
    });

    const currentBalance = accounts.reduce(
      (sum, acc) => sum + Number(acc.current_balance),
      0,
    );

    const transactions = await this.transactionRepo.find({
      where: {
        user_id: userId,
        startDate: Between(startDate, endDate),
      },
    });

    const totalIncome = transactions
      .filter((t) => t.type === TransactionType.income)
      .reduce((s, t) => s + Number(t.amount), 0);

    const totalExpense = transactions
      .filter((t) => t.type === TransactionType.expense)
      .reduce((s, t) => s + Number(t.amount), 0);

    const netCashFlow = totalIncome - totalExpense;

    const openingBalance = currentBalance - netCashFlow;

    return {
      opening_balance: openingBalance,
      total_income: totalIncome,
      total_expense: totalExpense,
      net_cash_flow: netCashFlow,
      closing_balance: currentBalance,
      operating_cash_flow: netCashFlow,
      investing_cash_flow: 0,
    };
  }

  // ============================================
  // NET WORTH
  // ============================================
  async getNetWorth(userId: number) {
    const accounts = await this.accountRepo.find({
      where: { user_id: userId, isActive: true },
    });

    let totalAssets = 0;
    let totalLiabilities = 0;

    const byAccount = accounts.map((acc) => {
      const balance = Number(acc.current_balance);

      if (acc.type === AccountType.credit_card && balance < 0) {
        totalLiabilities += Math.abs(balance);
      } else {
        totalAssets += balance;
      }

      return {
        account: acc.name,
        type: acc.type,
        balance,
      };
    });

    return {
      total_assets: totalAssets,
      total_liabilities: totalLiabilities,
      net_worth: totalAssets - totalLiabilities,
      by_account: byAccount,
    };
  }

  // ============================================
  // DASHBOARD SUMMARY
  // ============================================
  async getDashboardSummary(userId: number) {
    const now = new Date();

    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const previousMonthStart = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1,
    );
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const currentTransactions = await this.transactionRepo.find({
      where: {
        user_id: userId,
        startDate: Between(currentMonthStart, currentMonthEnd),
      },
      relations: ['category'],
    });

    const currentIncome = currentTransactions
      .filter((t) => t.type === TransactionType.income)
      .reduce((s, t) => s + Number(t.amount), 0);

    const currentExpense = currentTransactions
      .filter((t) => t.type === TransactionType.expense)
      .reduce((s, t) => s + Number(t.amount), 0);

    const previousTransactions = await this.transactionRepo.find({
      where: {
        user_id: userId,
        startDate: Between(previousMonthStart, previousMonthEnd),
      },
    });

    const previousIncome = previousTransactions
      .filter((t) => t.type === TransactionType.income)
      .reduce((s, t) => s + Number(t.amount), 0);

    const previousExpense = previousTransactions
      .filter((t) => t.type === TransactionType.expense)
      .reduce((s, t) => s + Number(t.amount), 0);

    const budgets = await this.budgetRepo.find({
      where: { user_id: userId, isActive: true },
    });

    const totalBudgeted = budgets.reduce((s, b) => s + Number(b.amount), 0);

    // Calculate total spent from actual expense transactions in current month
    const currentMonthExpenseTransactions = currentTransactions.filter(
      (t) => t.type === TransactionType.expense,
    );
    const totalSpent = currentMonthExpenseTransactions.reduce(
      (s, t) => s + Number(t.amount),
      0,
    );

    const categoryMap = new Map<string, number>();
    currentTransactions
      .filter((t) => t.type === TransactionType.expense && t.category)
      .forEach((t) => {
        const category = t.category.name;
        categoryMap.set(
          category,
          (categoryMap.get(category) || 0) + Number(t.amount),
        );
      });

    const topExpenses = Array.from(categoryMap.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    const recentTransactions = await this.transactionRepo.find({
      where: { user_id: userId },
      relations: ['account', 'category'],
      order: { startDate: 'DESC', createdAt: 'DESC' },
      take: 10,
    });

    return {
      current_month: {
        income: currentIncome,
        expense: currentExpense,
        net: currentIncome - currentExpense,
        savings_rate:
          currentIncome > 0
            ? ((currentIncome - currentExpense) / currentIncome) * 100
            : 0,
      },
      previous_month: {
        income: previousIncome,
        expense: previousExpense,
        net: previousIncome - previousExpense,
      },
      budget_summary: {
        total_budgeted: totalBudgeted,
        total_spent: totalSpent,
        remaining: totalBudgeted - totalSpent,
        percentage_used:
          totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0,
      },
      top_expenses: topExpenses,
      recent_transactions: recentTransactions,
    };
  }

  // ============================================
  // BASIC TRANSACTION LISTING
  // ============================================
  async getAllTransactions(
    userId: number,
    sort: 'asc' | 'desc' = 'desc',
    limit: number = 10,
    since?: string,
    fromId?: number,
  ) {
    const where: any = { user_id: userId };

    if (since) {
      where.startDate =
        sort === 'desc' ? MoreThan(new Date(since)) : LessThan(new Date(since));
    }

    if (fromId) {
      where.id = sort === 'desc' ? MoreThan(fromId) : LessThan(fromId);
    }

    return this.transactionRepo.find({
      where,
      relations: ['account', 'category'],
      order: { startDate: sort.toUpperCase() as 'ASC' | 'DESC' },
      take: limit,
    });
  }

  // =======================
  // Helper
  // =======================
  private getDateKey(date: Date, groupBy: 'day' | 'week' | 'month') {
    if (groupBy === 'day') {
      return date.toISOString().split('T')[0];
    }
    if (groupBy === 'week') {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      return weekStart.toISOString().split('T')[0];
    }
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }
}
