import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupMembersService } from '../groups-members/groups-members.service';
import { GroupMembersController } from '../groups-members/groups-members.controller';
import { GroupMember } from '../groups-members/entities/groups-member.entity';
import { Group } from '../groups/entities/group.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GroupMember, Group, User])],
  controllers: [GroupMembersController],
  providers: [GroupMembersService],
  exports: [GroupMembersService],
})
export class GroupMembersModule {}
