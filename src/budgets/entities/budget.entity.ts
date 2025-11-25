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

export enum Budgettype {
  weekly = 'weekly',
  monthly = 'monthly',
  yearly = 'yearly',
}

@Entity('budgets')
export class Budget {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'bigint', nullable: false, name: 'user_id' })
  user_id: number;

  @Column({ type: 'bigint', nullable: true, name: 'category_id' })
  category_id: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string;

  @Column({ type: 'decimal', precision: 19, scale: 2, nullable: false })
  amount: number;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
    enum: Budgettype,
  })
  period: Budgettype;

  @Column({ type: 'datetime', nullable: false, name: 'start_date' })
  startDate: Date;

  @Column({ type: 'datetime', nullable: true, name: 'end_date' })
  endDate: Date;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
    name: 'alert_threshold',
  })
  alertThreshold: number;

  @Column({ type: 'bit', nullable: false, default: 1, name: 'is_active' })
  isActive: boolean;

  @CreateDateColumn({ type: 'datetime', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => User, (user) => user.budgets)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @ManyToOne(() => Category, (category) => category.budgets)
  @JoinColumn({ name: 'category_id', referencedColumnName: 'id' })
  category: Category;
}
