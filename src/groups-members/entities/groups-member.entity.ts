import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Group } from '../../groups/entities/group.entity';
import { User } from '../../users/entities/user.entity';

export enum role {
  ADMIN = 'admin',
  MEMBER = 'member',
}

@Entity('group_members')
export class GroupMember {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint', nullable: false, name: 'group_id' })
  group_id: number;

  @Column({ type: 'int', nullable: false, name: 'user_id' })
  user_id: number;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
    default: 'member',
    enum: role,
    name: 'role',
  })
  role: role; // admin, member, viewer

  @Column({ type: 'datetime', nullable: false, name: 'joined_at' })
  joinedAt: Date;

  @Column({ type: 'bit', nullable: false, default: 1, name: 'is_active' })
  isActive: boolean;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Group, (group) => group.members)
  @JoinColumn({ name: 'group_id', referencedColumnName: 'id' })
  group: Group;

  @ManyToOne(() => User, (user) => user.groupMembers)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'user_id' })
  user: User;
}
