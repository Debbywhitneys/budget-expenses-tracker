import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupExpensesService } from './groups-expenses.service';
import { GroupExpensesController } from './groups-expenses.controller';
import { GroupExpense } from './entities/groups-expense.entity';
import { RecurringSplit } from '../expense-splits/entities/expense-split.entity';
import { GroupMembersModule } from '../groups-members/groups-members.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GroupExpense, RecurringSplit]),
    GroupMembersModule,
    NotificationsModule,
  ],
  controllers: [GroupExpensesController],
  providers: [GroupExpensesService],
  exports: [GroupExpensesService],
})
export class GroupExpensesModule {}
