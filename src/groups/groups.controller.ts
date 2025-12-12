import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { GroupsService } from './groups.service';
import { AccessTokenGuard } from '../auth/guards/access-token.guards';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@Controller('groups')
@UseGuards(AccessTokenGuard)
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Request() req, @Body() createDto: CreateGroupDto) {
    return this.groupsService.create(req.user.user_id, createDto);
  }

  @Get()
  findUserGroups(@Request() req) {
    return this.groupsService.findUserGroups(req.user.user_id);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.groupsService.findOne(req.user.user_id, id);
  }

  @Get(':id/balances')
  getGroupBalances(@Param('id', ParseIntPipe) id: number) {
    return this.groupsService.getGroupBalances(id);
  }

  @Patch(':id')
  update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateGroupDto,
  ) {
    return this.groupsService.update(req.user.user_id, id, updateDto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.groupsService.remove(req.user.user_id, id);
  }
}
