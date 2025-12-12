import {
  Injectable,
  Logger,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Group } from './entities/group.entity';
import {
  GroupMember,
  role as GroupRole,
} from '../groups-members/entities/groups-member.entity';
import {
  GroupExpense,
  split_method as SplitMethod,
} from '../groups-expenses/entities/groups-expense.entity';
import { RecurringSplit } from '../expense-splits/entities/expense-split.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { CreateGroupExpenseDto } from './dto/create-group-expense.dto';

@Injectable()
export class GroupsService {
  private readonly logger = new Logger(GroupsService.name);

  constructor(
    @InjectRepository(Group)
    private readonly groupRepo: Repository<Group>,

    @InjectRepository(GroupMember)
    private readonly memberRepo: Repository<GroupMember>,

    @InjectRepository(GroupExpense)
    private readonly expenseRepo: Repository<GroupExpense>,

    @InjectRepository(RecurringSplit)
    private readonly splitRepo: Repository<RecurringSplit>,
  ) {}

  // ------------------------
  // CREATE GROUP
  // ------------------------
  async create(user_id: number, createDto: CreateGroupDto): Promise<Group> {
    const group = this.groupRepo.create(createDto);
    const savedGroup = await this.groupRepo.save(group);

    // TypeORM save() typically returns a single entity for inserts

    // Add creator as admin
    await this.memberRepo.save({
      group_id: Number(savedGroup.id),
      user_id: user_id,
      role: GroupRole.ADMIN,
      joinedAt: new Date(),
      isActive: true,
    });

    return savedGroup;
  }

  // ------------------------
  // GET USER GROUPS
  // ------------------------
  async findUserGroups(user_id: number): Promise<Group[]> {
    const memberships = await this.memberRepo.find({
      where: { user_id, isActive: true },
      relations: ['group'],
    });

    const groups = memberships.map((m) => m.group);

    return groups;
  }

  // ------------------------
  // ADD MEMBER
  // ------------------------
  async addMember(
    requestUserId: number,
    group_id: number,
    newUserId: number,
  ): Promise<GroupMember> {
    await this.verifyAdmin(requestUserId, group_id);

    const member = this.memberRepo.create({
      group_id: group_id,
      user_id: newUserId,
      role: GroupRole.MEMBER,
      joinedAt: new Date(),
      isActive: true,
    });

    const savedMember = await this.memberRepo.save(member);
    return savedMember;
  }

  // ------------------------
  // CREATE EXPENSE
  // ------------------------
  async createExpense(
    user_id: number,
    group_id: number,
    dto: CreateGroupExpenseDto,
  ): Promise<GroupExpense> {
    await this.verifyMember(user_id, group_id);

    const expense = this.expenseRepo.create({
      ...dto,
      group_id: group_id,
      paid_by_id: user_id,
    });

    const savedExpense = await this.expenseRepo.save(expense);

    await this.createSplits(savedExpense, dto.members, dto.split_method);

    const result = await this.findExpenseWithSplits(savedExpense.id);
    if (!result) {
      throw new Error('Failed to fetch saved expense');
    }
    return result;
  }

  // ------------------------
  // CREATE SPLITS
  // ------------------------
  private async createSplits(
    expense: GroupExpense,
    members: number[],
    splitMethod: SplitMethod,
  ): Promise<void> {
    const totalAmount = Number(expense.total_amount);

    let splits: Array<{ user_id: number; amount: number }> = [];

    if (splitMethod === SplitMethod.equal) {
      const amountPerPerson = totalAmount / members.length;

      splits = members.map((userId) => ({
        user_id: userId,
        amount: amountPerPerson,
      }));
    }

    // Save splits
    for (const s of splits) {
      await this.splitRepo.save({
        group_expense_id: expense.id,
        user_id: s.user_id,
        amountOwed: s.amount,
        amountPaid: s.user_id === expense.paid_by_id ? s.amount : 0,
        isSettled: s.user_id === expense.paid_by_id,
      });
    }
  }

  // ------------------------
  // BALANCE SUMMARY
  // ------------------------
  async getGroupBalances(group_id: number): Promise<any[]> {
    const expenses = await this.expenseRepo.find({
      where: { group_id: group_id },
      relations: ['splits', 'paidBy'],
    });

    const balances = new Map<number, { owes: number; owed: number }>();

    for (const expense of expenses) {
      for (const split of expense.splits) {
        const userId = split.user_id;
        const balance = balances.get(userId) || { owes: 0, owed: 0 };

        if (userId === expense.paid_by_id) {
          balance.owed += Number(split.amountOwed);
        } else {
          balance.owes += Number(split.amountOwed);
        }

        balances.set(userId, balance);
      }
    }

    return Array.from(balances.entries()).map(([user_id, b]) => ({
      user_id,
      net_balance: b.owed - b.owes,
    }));
  }

  // ------------------------
  // VERIFY ADMIN
  // ------------------------
  private async verifyAdmin(userId: number, groupId: number): Promise<void> {
    const member = await this.memberRepo.findOne({
      where: {
        user_id: userId,
        group_id: groupId,
        role: GroupRole.ADMIN,
        isActive: true,
      },
    });

    if (!member) {
      throw new ForbiddenException('Only admins can perform this action');
    }
  }

  // ------------------------
  // VERIFY MEMBER
  // ------------------------
  private async verifyMember(userId: number, groupId: number): Promise<void> {
    const member = await this.memberRepo.findOne({
      where: {
        user_id: userId,
        group_id: groupId,
        isActive: true,
      },
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this group');
    }
  }

  // ------------------------
  // FETCH EXPENSE WITH SPLITS
  // ------------------------
  private async findExpenseWithSplits(
    expenseId: number,
  ): Promise<GroupExpense | null> {
    return this.expenseRepo.findOne({
      where: { id: expenseId },
      relations: ['splits', 'paidBy', 'category'],
    });
  }

  // ------------------------
  // GET ONE GROUP
  // ------------------------
  async findOne(userId: number, id: number): Promise<Group> {
    const group = await this.groupRepo.findOne({
      where: { id },
      relations: ['members', 'expenses'],
    });

    if (!group) {
      throw new NotFoundException(`Group ${id} not found`);
    }

    // Check if user is member
    await this.verifyMember(userId, id);
    return group;
  }

  // ------------------------
  // UPDATE GROUP
  // ------------------------
  async update(
    userId: number,
    id: number,
    updateDto: UpdateGroupDto,
  ): Promise<Group> {
    const group = await this.findOne(userId, id);

    // Only admin can update
    await this.verifyAdmin(userId, id);

    Object.assign(group, updateDto);
    const savedGroup = await this.groupRepo.save(group);
    return savedGroup;
  }

  // ------------------------
  // DELETE GROUP
  // ------------------------
  async remove(userId: number, id: number): Promise<{ message: string }> {
    const group = await this.findOne(userId, id);

    // Only admin can delete
    await this.verifyAdmin(userId, id);

    await this.groupRepo.remove(group);
    return { message: `Group ${id} deleted successfully` };
  }
}
