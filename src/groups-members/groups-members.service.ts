import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GroupMember, role } from './entities/groups-member.entity';
import { Group } from '../groups/entities/group.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class GroupMembersService {
  private readonly logger = new Logger(GroupMembersService.name);

  constructor(
    @InjectRepository(GroupMember)
    private readonly memberRepo: Repository<GroupMember>,
    @InjectRepository(Group)
    private readonly groupRepo: Repository<Group>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  // Add member to group
  async addMember(
    adminUserId: number,
    groupId: number,
    createDto: { user_id?: number; email?: string; role?: role },
  ): Promise<GroupMember> {
    this.logger.log(`Adding member to group ${groupId}`);

    // Verify admin rights
    await this.verifyAdmin(adminUserId, groupId);

    // Find user by ID or email
    let user: User | null = null;
    if (createDto.user_id) {
      user = await this.userRepo.findOne({
        where: { user_id: createDto.user_id },
      });
    } else if (createDto.email) {
      user = await this.userRepo.findOne({ where: { email: createDto.email } });
    }

    if (!user) {
      throw new NotFoundException(
        'User not found. They may need to register first.',
      );
    }

    // Check if already member
    const existing = await this.memberRepo.findOne({
      where: { group_id: groupId, user_id: user.user_id },
    });

    if (existing) {
      if (existing.isActive) {
        throw new BadRequestException('User is already a member of this group');
      } else {
        // Reactivate membership
        existing.isActive = true;
        return this.memberRepo.save(existing);
      }
    }

    // Create new membership
    const member = this.memberRepo.create({
      group_id: groupId,
      user_id: user.user_id,
      role: createDto.role || role.MEMBER,
      joinedAt: new Date(),
    });

    return this.memberRepo.save(member);
  }

  // Get all members of a group
  async findAllByGroup(groupId: number): Promise<GroupMember[]> {
    return this.memberRepo.find({
      where: { group_id: groupId, isActive: true },
      relations: ['user'],
      order: { joinedAt: 'ASC' },
    });
  }

  // Get user's groups
  async findUserGroups(userId: number): Promise<Group[]> {
    const memberships = await this.memberRepo.find({
      where: { user_id: userId, isActive: true },
      relations: ['group'],
    });

    return memberships.map((m) => m.group);
  }

  // Update member role
  async updateRole(
    adminUserId: number,
    groupId: number,
    memberId: number,
    newRole: role,
  ): Promise<GroupMember> {
    // Verify admin rights
    await this.verifyAdmin(adminUserId, groupId);

    const member = await this.memberRepo.findOne({
      where: { id: memberId, group_id: groupId },
    });

    if (!member) {
      throw new NotFoundException(`Member ${memberId} not found`);
    }

    // Cannot change own role
    if (member.user_id === adminUserId) {
      throw new BadRequestException('You cannot change your own role');
    }

    member.role = newRole;
    return this.memberRepo.save(member);
  }

  // Remove member from group
  async removeMember(
    adminUserId: number,
    groupId: number,
    memberId: number,
  ): Promise<{ message: string }> {
    // Verify admin rights
    await this.verifyAdmin(adminUserId, groupId);

    const member = await this.memberRepo.findOne({
      where: { id: memberId, group_id: groupId },
    });

    if (!member) {
      throw new NotFoundException(`Member ${memberId} not found`);
    }

    // Cannot remove self if last admin
    if (member.user_id === adminUserId) {
      const adminCount = await this.memberRepo.count({
        where: { group_id: groupId, role: role.ADMIN, isActive: true },
      });

      if (adminCount <= 1) {
        throw new BadRequestException(
          'Cannot remove the last admin. Assign another admin first.',
        );
      }
    }

    // Soft delete
    member.isActive = false;
    await this.memberRepo.save(member);

    return { message: `Member removed from group successfully` };
  }

  // Leave group (self-remove)
  async leaveGroup(
    userId: number,
    groupId: number,
  ): Promise<{ message: string }> {
    const member = await this.memberRepo.findOne({
      where: { user_id: userId, group_id: groupId, isActive: true },
    });

    if (!member) {
      throw new NotFoundException('You are not a member of this group');
    }

    // Check if last admin
    if (member.role === role.ADMIN) {
      const adminCount = await this.memberRepo.count({
        where: { group_id: groupId, role: role.ADMIN, isActive: true },
      });

      if (adminCount <= 1) {
        throw new BadRequestException(
          'You are the last admin. Assign another admin before leaving.',
        );
      }
    }

    member.isActive = false;
    await this.memberRepo.save(member);

    return { message: 'You have left the group successfully' };
  }

  // Check if user is member
  async isMember(userId: number, groupId: number): Promise<boolean> {
    const count = await this.memberRepo.count({
      where: { user_id: userId, group_id: groupId, isActive: true },
    });
    return count > 0;
  }

  // Check if user is admin
  async isAdmin(userId: number, groupId: number): Promise<boolean> {
    const count = await this.memberRepo.count({
      where: {
        user_id: userId,
        group_id: groupId,
        role: role.ADMIN,
        isActive: true,
      },
    });
    return count > 0;
  }

  // Verify admin access
  private async verifyAdmin(userId: number, groupId: number): Promise<void> {
    const isAdmin = await this.isAdmin(userId, groupId);

    if (!isAdmin) {
      throw new ForbiddenException('Only group admins can perform this action');
    }
  }
}
