import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum NotificationType {
  budget_alert = 'budget_alert',
  bill_reminder = 'bill_reminder',
  goal_milestone = 'goal_milestone',
  settlement_request = 'settlement_request',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'bigint', nullable: false, name: 'user_id' })
  user_id: number;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    enum: NotificationType,
  })
  type: NotificationType;

  @Column({ type: 'varchar', length: 2000, nullable: true })
  message: string;

  @Column({ type: 'bit', nullable: false, default: 0, name: 'is_read' })
  isRead: boolean;

  @CreateDateColumn({ type: 'datetime', name: 'created_at' })
  createdAt: Date;

  @Column({ type: 'datetime', nullable: true, name: 'read_at' })
  readAt: Date;

  // Relationships
  @ManyToOne(() => User, (user) => user.notifications)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;
}
