import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  IsUrl,
  IsEnum,
} from 'class-validator';
import { GroupType } from '../entities/group.entity';

export class CreateGroupDto {
  @IsString()
  @IsNotEmpty()
  group_id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(GroupType)
  @IsNotEmpty()
  GroupType: GroupType;

  @IsString()
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
