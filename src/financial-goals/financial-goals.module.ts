import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinancialGoalsService } from './financial-goals.service';
import { FinancialGoalsController } from './financial-goals.controller';
import { FinancialGoal } from './entities/financial-goal.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([FinancialGoal]), NotificationsModule],
  controllers: [FinancialGoalsController],
  providers: [FinancialGoalsService],
  exports: [FinancialGoalsService],
})
export class FinancialGoalsModule {}
