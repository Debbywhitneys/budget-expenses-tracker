import { Module } from '@nestjs/common';
import { FinancialGoalsService } from './financial-goals.service';
import { FinancialGoalsController } from './financial-goals.controller';
import { FinancialGoal } from './entities/financial-goal.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([FinancialGoal])],
  controllers: [FinancialGoalsController],
  providers: [FinancialGoalsService],
})
export class FinancialGoalsModule {}
