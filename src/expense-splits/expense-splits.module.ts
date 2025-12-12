import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpenseSplitsService } from './expense-splits.service';
import { ExpenseSplitsController } from './expense-splits.controller';
import { RecurringSplit } from './entities/expense-split.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RecurringSplit])],
  controllers: [ExpenseSplitsController],
  providers: [ExpenseSplitsService],
  exports: [ExpenseSplitsService],
})
export class ExpenseSplitsModule {}
