import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { GroupMembersService } from './groups-members.service';
import { role } from './entities/groups-member.entity';

@Controller('groups')
export class GroupMembersController {
  constructor(private readonly groupMembersService: GroupMembersService) {}

  // ============================================
  // ADD MEMBER
  // ============================================
  @Post(':groupId/members')
  addMember(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Query('adminUserId', ParseIntPipe) adminUserId: number,
    @Body()
    createDto: {
      user_id?: number;
      email?: string;
      role?: role;
    },
  ) {
    return this.groupMembersService.addMember(adminUserId, groupId, createDto);
  }

  // ============================================
  // GET ALL MEMBERS OF A GROUP
  // ============================================
  @Get(':groupId/members')
  findAllByGroup(@Param('groupId', ParseIntPipe) groupId: number) {
    return this.groupMembersService.findAllByGroup(groupId);
  }

  // ============================================
  // GET GROUPS THAT A USER BELONGS TO
  // ============================================
  @Get('user/:userId')
  findUserGroups(@Param('userId', ParseIntPipe) userId: number) {
    return this.groupMembersService.findUserGroups(userId);
  }

  // ============================================
  // UPDATE MEMBER ROLE
  // ============================================
  @Patch(':groupId/members/:memberId/role')
  updateRole(
    @Query('adminUserId', ParseIntPipe) adminUserId: number,
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Body('newRole') newRole: role,
  ) {
    return this.groupMembersService.updateRole(
      adminUserId,
      groupId,
      memberId,
      newRole,
    );
  }

  // ============================================
  // REMOVE MEMBER (ADMIN ACTION)
  // ============================================
  @Delete(':groupId/members/:memberId')
  removeMember(
    @Query('adminUserId', ParseIntPipe) adminUserId: number,
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
  ) {
    return this.groupMembersService.removeMember(
      adminUserId,
      groupId,
      memberId,
    );
  }

  // ============================================
  // LEAVE GROUP (SELF REMOVE)
  // ============================================
  @Delete(':groupId/leave')
  leaveGroup(
    @Query('userId', ParseIntPipe) userId: number,
    @Param('groupId', ParseIntPipe) groupId: number,
  ) {
    return this.groupMembersService.leaveGroup(userId, groupId);
  }

  // ============================================
  // CHECK IF USER IS MEMBER
  // ============================================
  @Get(':groupId/is-member/:userId')
  isMember(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('groupId', ParseIntPipe) groupId: number,
  ) {
    return this.groupMembersService.isMember(userId, groupId);
  }

  // ============================================
  // CHECK IF USER IS ADMIN
  // ============================================
  @Get(':groupId/is-admin/:userId')
  isAdmin(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('groupId', ParseIntPipe) groupId: number,
  ) {
    return this.groupMembersService.isAdmin(userId, groupId);
  }
}
