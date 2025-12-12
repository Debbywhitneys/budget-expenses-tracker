import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Account } from '../../accounts/entities/account.entity';
import { Category } from '../../categories/entities/category.entity';

export enum recurringTransactionType {
  income = 'income',
  expense = 'expense',
}

export enum frequency {
  daily = 'daily',
  weekly = 'weekly',
  monthly = 'monthly',
  yearly = 'yearly',
}

@Entity('recurring_transactions')
export class RecurringTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint', nullable: false, name: 'user_id' })
  user_id: number;

  @Column({ type: 'decimal', nullable: false })
  amount: number;

  // MS SQL does NOT support enum → store as varchar
  @Column({
    type: 'varchar',
    length: 20,
    enum: recurringTransactionType,
  })
  type: recurringTransactionType;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 50, enum: frequency, nullable: false })
  frequency: frequency;

  @Column({ type: 'datetime' })
  startDate: Date;

  @Column({ type: 'datetime', nullable: true })
  endDate: Date;

  @Column({ type: 'datetime' })
  nextOccurrenceDate: Date;

  @Column({ type: 'bit', default: 1 })
  isActive: boolean;

  @Column({ type: 'bigint', nullable: false, name: 'account_id' })
  account_id: number;

  @Column({ type: 'bigint', nullable: false, name: 'category_id' })
  category_id: number;

  @CreateDateColumn({ type: 'datetime', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.recurringTransactions)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'user_id' })
  user: User;

  @ManyToOne(() => Account, (account) => account.transactions)
  @JoinColumn({ name: 'account_id', referencedColumnName: 'id' })
  account: Account;

  @ManyToOne(() => Category, (category) => category.transactions)
  @JoinColumn({ name: 'category_id', referencedColumnName: 'id' })
  category: Category;
}
