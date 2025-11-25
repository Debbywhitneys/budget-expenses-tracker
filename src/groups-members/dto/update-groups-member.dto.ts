import { PartialType } from '@nestjs/mapped-types';
import { CreateGroupMemberDto } from './create-groups-member.dto';

export class UpdateGroupMemberDto extends PartialType(CreateGroupMemberDto) {}
