import { Module } from '@nestjs/common';
import { GroupMembersService } from './groups-members.service';
import { GroupMembersController } from './groups-members.controller';
import { GroupMember } from './entities/groups-member.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([GroupMember])],
  controllers: [GroupMembersController],
  providers: [GroupMembersService],
})
export class GroupsMembersModule {}
