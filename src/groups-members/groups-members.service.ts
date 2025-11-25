import { Injectable } from '@nestjs/common';
import { CreateGroupMemberDto } from './dto/create-groups-member.dto';
import { UpdateGroupMemberDto } from './dto/update-groups-member.dto';

@Injectable()
export class GroupMembersService {
  create(createGroupMemberDto: CreateGroupMemberDto) {
    return 'This action adds a new groupsMember';
  }

  findAll() {
    return `This action returns all groupsMembers`;
  }

  findOne(id: number) {
    return `This action returns a #${id} groupsMember`;
  }

  update(id: number, updateGroupMemberDto: UpdateGroupMemberDto) {
    return `This action updates a #${id} groupsMember`;
  }

  remove(id: number) {
    return `This action removes a #${id} groupsMember`;
  }
}
