import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettlementsService } from './settlements.service';
import { SettlementsController } from './settlements.controller';
import { Settlement } from './entities/settlement.entity';
import { RecurringSplit } from '../expense-splits/entities/expense-split.entity';
import { Group } from '../groups/entities/group.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Settlement, RecurringSplit, Group]),
    NotificationsModule,
  ],
  controllers: [SettlementsController],
  providers: [SettlementsService],
  exports: [SettlementsService],
})
export class SettlementsModule {}
