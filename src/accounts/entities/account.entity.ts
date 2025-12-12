import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';

export enum AccountType {
  credit_card = 'credit_card',
  cash = 'cash',
  bank = 'bank',
}

@Entity('accounts')
export class Account {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false, name: 'user_id' })
  user_id: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
    enum: AccountType,
  })
  type: AccountType;

  @Column({ type: 'varchar', length: 10, nullable: false })
  currency: string;

  @Column({ type: 'decimal', precision: 19, scale: 2, nullable: false })
  initial_balance: number;

  @Column({ type: 'decimal', precision: 19, scale: 2, nullable: false })
  current_balance: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  institution_name: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  account_number: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  icon: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  color: string;

  @Column({ type: 'bit', nullable: false, default: 1, name: 'is_active' })
  isActive: boolean;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => User, (user) => user.accounts)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'user_id' })
  user: User;

  @OneToMany(() => Transaction, (transaction) => transaction.account)
  transactions: Transaction[];
}
