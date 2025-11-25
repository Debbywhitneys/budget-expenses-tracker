import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Group } from '../../groups/entities/group.entity';
import { User } from '../../users/entities/user.entity';
import { RecurringSplit } from '../../expense-splits/entities/expense-split.entity';

export enum split_method {
  equal = 'equal',
  percentage = 'percentage',
  exact_amounts = 'exact_amounts',
  shares = 'shares',
}

@Entity('group_expenses')
export class GroupExpense {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({
    type: 'int',
    nullable: false,
    name: 'group_id',
  })
  group_id: number;

  @Column({ type: 'bigint', nullable: false, name: 'paid_by_jf' })
  paid_id: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 19, scale: 2, nullable: false })
  total_amount: number;

  @Column({ type: 'varchar', length: 10, nullable: false })
  currency: string;

  @Column({ type: 'bigint', nullable: true })
  category_id: number;

  @Column({ type: 'datetime', nullable: false, name: 'expense_date' })
  expenseDate: Date;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  receipt_url: string;

  @Column({ type: 'varchar', length: 2000, nullable: true })
  notes: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
    enum: split_method,
  })
  split_method: split_method;

  @Column({ type: 'bit', nullable: false, default: 0, name: 'is_settled' })
  isSettled: boolean;

  @CreateDateColumn({ type: 'datetime', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Group, (group) => group.expenses)
  @JoinColumn({ name: 'group_id', referencedColumnName: 'id' })
  group: Group;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'paid_by', referencedColumnName: 'id' })
  paidBy: User;

  @OneToMany(() => RecurringSplit, (split) => split.groupExpense)
  splits: RecurringSplit[];
}
