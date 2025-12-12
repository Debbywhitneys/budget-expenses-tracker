import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';
import { Account } from '../../accounts/entities/account.entity';

export enum TransactionType {
  income = 'income',
  expense = 'expense',
  transfer = 'transfer',
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false, name: 'user_id' })
  user_id: number;

  @Column({
    type: 'bigint',
    nullable: true,
    name: 'account_id',
  })
  account_id: number;

  @Column({ type: 'bigint', nullable: true, name: 'category_id' })
  category_id: number;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
    enum: TransactionType,
  })
  type: TransactionType;

  @Column({ type: 'decimal', precision: 19, scale: 2, nullable: false })
  amount: number;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  description: string;

  @Column({ type: 'bit', nullable: true })
  is_recurring: boolean;

  @Column({ type: 'varchar', nullable: true, name: 'location' })
  location: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'receipt_url' })
  receipt_url: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'tags' })
  tags: string;

  @Column({ type: 'text', nullable: true, name: 'notes' })
  notes: string;

  @Column({ type: 'datetime', nullable: true, name: 'start_date' })
  startDate: Date;

  @Column({ type: 'datetime', nullable: true, name: 'end_date' })
  endDate: Date;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => User, (user) => user.transactions)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'user_id' })
  user: User;

  @ManyToOne(() => Account, (account) => account.transactions)
  @JoinColumn({ name: 'account_id', referencedColumnName: 'id' })
  account: Account;

  @ManyToOne(() => Category, (category) => category.transactions)
  @JoinColumn({ name: 'category_id', referencedColumnName: 'id' })
  category: Category;
}
