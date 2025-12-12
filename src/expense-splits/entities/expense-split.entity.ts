import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { GroupExpense } from '../../groups-expenses/entities/groups-expense.entity';
import { User } from '../../users/entities/user.entity';

@Entity('recurring_splits')
export class RecurringSplit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint', nullable: true, name: 'group_expense_id' })
  group_expense_id: number;

  @Column({ type: 'bigint', nullable: false, name: 'user_id' })
  user_id: number;

  @Column({
    type: 'decimal',
    precision: 19,
    scale: 2,
    nullable: false,
    name: 'amount_owed',
  })
  amountOwed: number;

  @Column({
    type: 'decimal',
    precision: 19,
    scale: 2,
    nullable: true,
    name: 'amount_paid',
  })
  amountPaid: number;

  @Column({ type: 'bit', nullable: false, default: 0, name: 'is_settled' })
  isSettled: boolean;

  @Column({ type: 'datetime', nullable: true })
  settled_at: Date;

  @CreateDateColumn({ type: 'datetime', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => GroupExpense, (expense) => expense.splits)
  @JoinColumn({ name: 'group_expense_id', referencedColumnName: 'id' })
  groupExpense: GroupExpense;

  @ManyToOne(() => User, (user) => user.expenseSplits)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'user_id' })
  user: User;
}
