import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { Group } from './entities/group.entity';
import { GroupMember } from '../groups-members/entities/groups-member.entity';
import { GroupExpense } from '../groups-expenses/entities/groups-expense.entity';
import { RecurringSplit } from '../expense-splits/entities/expense-split.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Group,
      GroupMember,
      GroupExpense,
      RecurringSplit,
    ]),
  ],
  controllers: [GroupsController],
  providers: [GroupsService],
  exports: [GroupsService],
})
export class GroupsModule {}
