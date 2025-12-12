import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { SettlementsService } from './settlements.service';
import { AccessTokenGuard } from '../auth/guards/access-token.guards';
import { CreateSettlementDto } from './dto/create-settlement.dto';
import { UpdateSettlementDto } from './dto/update-settlement.dto';

@Controller('settlements')
@UseGuards(AccessTokenGuard)
export class SettlementsController {
  constructor(private readonly settlementsService: SettlementsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Request() req, @Body() createDto: CreateSettlementDto) {
    return this.settlementsService.create(req.user.user_id, createDto);
  }

  @Get('group/:groupId')
  findAllByGroup(@Param('groupId', ParseIntPipe) groupId: number) {
    return this.settlementsService.findAllByGroup(groupId);
  }

  @Get('user/:userId/group/:groupId')
  findUserSettlements(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('groupId', ParseIntPipe) groupId: number,
  ) {
    return this.settlementsService.findUserSettlements(userId, groupId);
  }

  @Get('history')
  getSettlementHistory(
    @Query('group_id', ParseIntPipe) group_id: number,
    @Query('user1_id', ParseIntPipe) user1_id: number,
  ) {
    return this.settlementsService.getSettlementHistory(group_id, user1_id);
  }

  @Patch(':id')
  update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateSettlementDto,
  ) {
    return this.settlementsService.update(req.user.user_id, id, updateDto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.settlementsService.remove(req.user.user_id, id);
  }
}
