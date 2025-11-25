import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { GroupExpense } from '../../groups-expenses/entities/groups-expense.entity';
import { GroupMember } from '../../groups-members/entities/groups-member.entity';
import { Settlement } from '../../settlements/entities/settlement.entity';

export enum GroupType {
  couples = 'couples',
  organizations = 'organizations',
  family = 'family',
  friends = 'friends',
  roommates = 'roommates',
  others = 'others',
}

@Entity('groups')
export class Group {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
    name: 'group_id',
  })
  group_id: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  description: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
    enum: GroupType,
  })
  GroupType: GroupType;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'image_url' })
  imageUrl: string;

  @Column({ type: 'bit', nullable: false, default: 1, name: 'is_active' })
  isActive: boolean;

  @CreateDateColumn({ type: 'datetime', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @OneToMany(() => GroupMember, (member) => member.group)
  members: GroupMember[];

  @OneToMany(() => GroupExpense, (expense) => expense.group)
  expenses: GroupExpense[];

  @OneToMany(() => Settlement, (settlement) => settlement.group)
  settlements: Settlement[];
}
