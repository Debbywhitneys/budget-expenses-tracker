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

@Entity('settlements')
export class Settlement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint', nullable: false, name: 'group_id' })
  group_id: number;

  @Column({ type: 'int', nullable: false, name: 'payer_id' })
  payer_id: number;

  @Column({ type: 'decimal', precision: 19, scale: 2, nullable: false })
  amount: number;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    name: 'payment_method',
  })
  paymentMethod: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    name: 'reference_number',
  })
  referenceNumber: string;

  @Column({ type: 'varchar', length: 2000, nullable: true })
  notes: string;

  @Column({ type: 'datetime', nullable: false })
  date: Date;

  @CreateDateColumn({ type: 'datetime', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Group, (group) => group.settlements)
  @JoinColumn({ name: 'group_id', referencedColumnName: 'id' })
  group: Group;

  @ManyToOne(() => User, (user) => user.settlements)
  @JoinColumn({ name: 'payer_id', referencedColumnName: 'user_id' })
  payer: User;
}
