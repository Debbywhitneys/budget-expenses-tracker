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
  ValidationPipe,
} from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { AccessTokenGuard } from '../auth/guards/access-token.guards';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@Controller('accounts')
@UseGuards(AccessTokenGuard)
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Request() req, @Body(ValidationPipe) createDto: CreateAccountDto) {
    return this.accountsService.create(createDto.user_id, createDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.accountsService.findAll(req.user.user_id);
  }

  @Get('total-balance')
  getTotalBalance(@Request() req) {
    return this.accountsService.getTotalBalance(req.user.user_id);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.accountsService.findOneWithTransactions(req.user.user_id, id);
  }

  @Patch(':id')
  update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateAccountDto,
  ) {
    return this.accountsService.update(req.user.user_id, id, updateDto);
  }

  @Patch(':id/adjust-balance')
  adjustBalance(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { new_balance: number; reason: string },
  ) {
    return this.accountsService.adjustBalance(
      req.user.user_id,
      id,
      body.new_balance,
      body.reason,
    );
  }

  @Patch(':id/archive')
  archive(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.accountsService.archive(req.user.user_id, id);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.accountsService.remove(req.user.user_id, id);
  }
}
