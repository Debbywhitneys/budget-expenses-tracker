import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum FinancialGoaltype {
  emergency_fund = 'emergency_fund',
  vacation = 'vacation',
  purchase = 'purchase',
  debt_payoff = 'debt_payoff',
  retirement = 'retirement',
  other = 'other',
}

export enum priority {
  low = 'low',
  medium = 'medium',
  high = 'high',
}

@Entity('financial_goals')
export class FinancialGoal {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'bigint', nullable: false, name: 'user_id' })
  user_id: number;

  @Column({ type: 'varchar', length: 1000, nullable: false })
  description: string;

  @Column({
    type: 'decimal',
    precision: 19,
    scale: 2,
    nullable: false,
    name: 'target_amount',
  })
  targetAmount: number;

  @Column({
    type: 'decimal',
    precision: 19,
    scale: 2,
    nullable: true,
    name: 'current_amount',
  })
  currentAmount: number;

  @Column({ type: 'datetime', nullable: true })
  deadline: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    enum: FinancialGoaltype,
  })
  FinancialGoaltype: FinancialGoaltype;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    enum: priority,
  })
  priority: priority;

  @Column({ type: 'bit', nullable: false, default: 0, name: 'is_achieved' })
  isAchieved: boolean;

  @CreateDateColumn({ type: 'datetime', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => User, (user) => user.financialGoals)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;
}
