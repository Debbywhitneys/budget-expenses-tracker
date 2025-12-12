import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { Budget } from '../../budgets/entities/budget.entity';
import { FinancialGoal } from '../../financial-goals/entities/financial-goal.entity';
import { Account } from '../../accounts/entities/account.entity';
import { Notification } from '../../notifications/entities/notification.entity';
import { GroupMember } from '../../groups-members/entities/groups-member.entity';
import { GroupExpense } from '../../groups-expenses/entities/groups-expense.entity';
import { RecurringSplit } from '../../expense-splits/entities/expense-split.entity';
import { RecurringTransaction } from '../../recurring-transactions/entities/recurring-transaction.entity';
import { Settlement } from '../../settlements/entities/settlement.entity';

export enum userRole {
  SYSTEM_ADMIN = 'system_admin',
  USER = 'user',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  user_id: number;

  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  passwordHash: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  fullName: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phoneNumber?: string;

  @Column({
    type: 'varchar',
    enum: userRole,
    default: userRole.USER,
  })
  userRole: userRole;

  @Column({ type: 'varchar', length: 255, nullable: true })
  hashedRefreshedToken?: string | null;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  profilePictureUrl: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  currency: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  timezone: string;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;

  // Relationships
  @OneToMany(() => Category, (category) => category.user)
  categories: Category[];

  @OneToMany(() => Account, (account) => account.user)
  accounts: Account[];

  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions: Transaction[];

  @OneToMany(() => Budget, (budget) => budget.user)
  budgets: Budget[];

  @OneToMany(() => FinancialGoal, (goal) => goal.user)
  financialGoals: FinancialGoal[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  @OneToMany(() => GroupMember, (member) => member.user)
  groupMembers: GroupMember[];

  @OneToMany(() => GroupExpense, (expense) => expense.paidBy)
  groupExpenses: GroupExpense[];

  @OneToMany(() => RecurringSplit, (split) => split.user)
  expenseSplits: RecurringSplit[];

  @OneToMany(() => RecurringTransaction, (recurring) => recurring.user)
  recurringTransactions: RecurringTransaction[];

  @OneToMany(() => Settlement, (settlement) => settlement.payer)
  settlements: Settlement[];
}
