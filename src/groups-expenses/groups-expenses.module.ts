import { Module } from '@nestjs/common';
import { GroupsExpensesService } from './groups-expenses.service';
import { GroupsExpensesController } from './groups-expenses.controller';
import { GroupExpense } from './entities/groups-expense.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([GroupExpense])],
  controllers: [GroupsExpensesController],
  providers: [GroupsExpensesService],
})
export class GroupsExpensesModule {}
