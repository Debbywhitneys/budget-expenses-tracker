import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsDate,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { role } from '../entities/groups-member.entity';

export class CreateGroupMemberDto {
  @IsNumber()
  @IsNotEmpty()
  group_id: number;

  @IsNumber()
  @IsNotEmpty()
  user_id: number;

  @IsString()
  @IsNotEmpty()
  role: role;

  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  joinedAt: Date;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
