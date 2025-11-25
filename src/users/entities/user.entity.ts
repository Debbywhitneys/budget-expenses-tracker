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

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  passwordHash: string;

  @Column({
    type: 'bigint',
    nullable: false,
    unique: true,
    name: 'user_id',
  })
  user_id: number;

  @Column({ type: 'varchar', length: 255, nullable: false, name: 'username' })
  username: string;

  @Column({ type: 'varchar', length: 255, nullable: false, name: 'fullName' })
  fullName: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
    name: 'phone_number',
  })
  phoneNumber: string;

  @Column({ type: 'bit', nullable: false, default: 0, name: 'is_system_admin' })
  isSystemAdmin: boolean;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    name: 'profile_picture_url',
  })
  profile_picture_url: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  currency: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  timezone: string;

  @CreateDateColumn({ type: 'datetime', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'updated_at' })
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
}
