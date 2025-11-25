import { Module } from '@nestjs/common';
import { ExpenseSplitsService } from './expense-splits.service';
import { ExpenseSplitsController } from './expense-splits.controller';
import { RecurringSplit } from './entities/expense-split.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([RecurringSplit])],
  controllers: [ExpenseSplitsController],
  providers: [ExpenseSplitsService],
})
export class ExpenseSplitsModule {}
