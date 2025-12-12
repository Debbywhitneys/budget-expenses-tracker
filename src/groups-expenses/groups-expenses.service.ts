import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GroupExpense, split_method } from './entities/groups-expense.entity';
import { RecurringSplit } from '../expense-splits/entities/expense-split.entity';
import { GroupMembersService } from '../groups-members/groups-members.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';
import {
  CreateGroupExpenseWithMembersDto,
  ExpenseMemberDto,
} from './dto/create-groups-expense.dto';
import { UpdateGroupsExpenseDto } from './dto/update-groups-expense.dto';

@Injectable()
export class GroupExpensesService {
  private readonly logger = new Logger(GroupExpensesService.name);

  constructor(
    @InjectRepository(GroupExpense)
    private readonly expenseRepo: Repository<GroupExpense>,
    @InjectRepository(RecurringSplit)
    private readonly splitRepo: Repository<RecurringSplit>,
    private readonly groupMembersService: GroupMembersService,
    private readonly notificationsService: NotificationsService,
  ) {}

  // Create group expense
  async create(
    userId: number,
    groupId: number,
    createDto: CreateGroupExpenseWithMembersDto,
  ): Promise<GroupExpense> {
    this.logger.log(`Creating group expense for group ${groupId}`);

    // Verify user is member
    const isMember = await this.groupMembersService.isMember(userId, groupId);
    if (!isMember) {
      throw new ForbiddenException('You are not a member of this group');
    }

    // Create expense
    const expense = this.expenseRepo.create({
      group_id: groupId,
      paid_by_id: userId,
      name: createDto.name,
      description: createDto.description,
      total_amount: createDto.total_amount,
      currency: createDto.currency,
      category_id: createDto.category_id,
      split_method: createDto.split_method,
      expenseDate: createDto.expenseDate,
      receipt_url: createDto.receipt_url,
      notes: createDto.notes,
    });

    const savedExpense = await this.expenseRepo.save(expense);

    // Create splits
    await this.createSplits(
      savedExpense,
      createDto.members,
      createDto.split_method,
    );

    // Notify members
    await this.notifyMembers(savedExpense, createDto.members);

    this.logger.log(`Group expense ${savedExpense.id} created successfully`);

    return this.findOneWithSplits(savedExpense.id);
  }

  // Create expense splits
  private async createSplits(
    expense: GroupExpense,
    members: ExpenseMemberDto[],
    splitMethod: split_method,
  ): Promise<void> {
    const totalAmount = Number(expense.total_amount);

    for (const member of members) {
      let amountOwed = 0;

      switch (splitMethod) {
        case split_method.equal:
          amountOwed = totalAmount / members.length;
          break;

        case split_method.percentage:
          if (!member.percentage) {
            throw new BadRequestException(
              'Percentage required for percentage split',
            );
          }
          amountOwed = (totalAmount * member.percentage) / 100;
          break;

        case split_method.exact_amounts:
          if (!member.amount) {
            throw new BadRequestException('Amount required for custom split');
          }
          amountOwed = member.amount;
          break;
      }

      const isPayee = member.user_id === expense.paid_by_id;

      await this.splitRepo.save({
        group_expense_id: expense.id,
        user_id: member.user_id,
        amountOwed: amountOwed,
        amountPaid: isPayee ? amountOwed : 0,
        isSettled: isPayee,
        settled_at: isPayee ? new Date() : undefined,
      });
    }

    // Validate split total matches expense total
    const splits = await this.splitRepo.find({
      where: { group_expense_id: expense.id },
    });

    const splitTotal = splits.reduce((sum, s) => sum + Number(s.amountOwed), 0);

    if (Math.abs(splitTotal - totalAmount) > 0.01) {
      throw new BadRequestException(
        `Split total (${splitTotal}) doesn't match expense total (${totalAmount})`,
      );
    }
  }

  // Notify group members about new expense
  private async notifyMembers(
    expense: GroupExpense,
    members: ExpenseMemberDto[],
  ): Promise<void> {
    for (const member of members) {
      if (member.user_id !== expense.paid_by_id) {
        await this.notificationsService.create({
          user_id: member.user_id,
          type: NotificationType.group_expense_created,
          title: 'New Group Expense',
          message: `${expense.name} - ${expense.total_amount} ${expense.currency}`,
          action_url: `/groups/${expense.group_id}/expenses/${expense.id}`,
        });
      }
    }
  }

  // Get all expenses for a group
  async findAllByGroup(
    groupId: number,
    filters?: {
      start_date?: Date;
      end_date?: Date;
      is_settled?: boolean;
    },
  ): Promise<GroupExpense[]> {
    const queryBuilder = this.expenseRepo
      .createQueryBuilder('expense')
      .leftJoinAndSelect('expense.paid_by', 'payer')
      .leftJoinAndSelect('expense.category', 'category')
      .leftJoinAndSelect('expense.splits', 'splits')
      .leftJoinAndSelect('splits.user', 'user')
      .where('expense.group_id = :groupId', { groupId });

    if (filters?.start_date && filters?.end_date) {
      queryBuilder.andWhere('expense.expense_date BETWEEN :start AND :end', {
        start: filters.start_date,
        end: filters.end_date,
      });
    }

    if (filters?.is_settled !== undefined) {
      queryBuilder.andWhere('expense.is_settled = :isSettled', {
        isSettled: filters.is_settled,
      });
    }

    return queryBuilder.orderBy('expense.expense_date', 'DESC').getMany();
  }

  // Get one expense with splits
  async findOneWithSplits(id: number): Promise<GroupExpense> {
    const expense = await this.expenseRepo.findOne({
      where: { id },
      relations: ['paid_by', 'category', 'splits', 'splits.user'],
    });

    if (!expense) {
      throw new NotFoundException(`Expense ${id} not found`);
    }

    return expense;
  }

  // Get user's share in group expenses
  async getUserExpenses(
    userId: number,
    groupId: number,
  ): Promise<{
    paid: GroupExpense[];
    owes: Array<{
      expense: GroupExpense;
      amount_owed: number;
      amount_paid: number;
    }>;
    total_paid: number;
    total_owed: number;
  }> {
    // Expenses user paid for
    const paid = await this.expenseRepo.find({
      where: { group_id: groupId, paid_by_id: userId },
      relations: ['splits', 'splits.user'],
      order: { expenseDate: 'DESC' },
    });

    // Expenses user owes
    const splits = await this.splitRepo
      .createQueryBuilder('split')
      .innerJoinAndSelect('split.group_expense', 'expense')
      .where('expense.group_id = :groupId', { groupId })
      .andWhere('split.user_id = :userId', { userId })
      .andWhere('split.is_settled = :isSettled', { isSettled: false })
      .getMany();

    const owes = splits.map((split) => ({
      expense: split.groupExpense,
      amount_owed: Number(split.amountOwed),
      amount_paid: Number(split.amountPaid),
    }));

    const totalPaid = paid.reduce((sum, e) => sum + Number(e.total_amount), 0);
    const totalOwed = owes.reduce(
      (sum, o) => sum + (o.amount_owed - o.amount_paid),
      0,
    );

    return {
      paid,
      owes,
      total_paid: totalPaid,
      total_owed: totalOwed,
    };
  }

  // Update expense
  async update(
    userId: number,
    id: number,
    updateDto: UpdateGroupsExpenseDto,
  ): Promise<GroupExpense> {
    const expense = await this.findOneWithSplits(id);

    // Only creator or admin can update
    const isAdmin = await this.groupMembersService.isAdmin(
      userId,
      expense.group_id,
    );
    if (expense.paid_by_id !== userId && !isAdmin) {
      throw new ForbiddenException(
        'Only the creator or admin can update this expense',
      );
    }

    Object.assign(expense, updateDto);
    return this.expenseRepo.save(expense);
  }

  // Delete expense
  async remove(userId: number, id: number): Promise<{ message: string }> {
    const expense = await this.findOneWithSplits(id);

    // Only creator or admin can delete
    const isAdmin = await this.groupMembersService.isAdmin(
      userId,
      expense.group_id,
    );
    if (expense.paid_by_id !== userId && !isAdmin) {
      throw new ForbiddenException(
        'Only the creator or admin can delete this expense',
      );
    }

    // Check if any splits are settled
    const settledSplits = expense.splits.filter(
      (s) => s.isSettled && s.user_id !== expense.paid_by_id,
    );
    if (settledSplits.length > 0) {
      throw new BadRequestException(
        'Cannot delete expense with settled splits',
      );
    }

    await this.expenseRepo.remove(expense);

    return { message: `Expense ${id} deleted successfully` };
  }

  // Export group expenses to CSV
  async exportToCSV(groupId: number): Promise<any[]> {
    const expenses = await this.findAllByGroup(groupId);

    return expenses.flatMap((expense) =>
      expense.splits.map((split) => ({
        date: expense.expenseDate,
        description: expense.name,
        paidBy: expense.paidBy?.fullName || 'Unknown',
        member: split.user?.fullName || 'Unknown',
        amount: split.amountOwed,
        paid: split.amountPaid,
        settled: split.isSettled,
        currency: expense.currency,
      })),
    );
  }
}
