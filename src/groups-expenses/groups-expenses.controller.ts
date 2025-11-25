import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { GroupsExpensesService } from './groups-expenses.service';
import { CreateGroupExpenseDto } from './dto/create-groups-expense.dto';
import { UpdateGroupsExpenseDto } from './dto/update-groups-expense.dto';

@Controller('groups-expenses')
export class GroupsExpensesController {
  constructor(private readonly groupsExpensesService: GroupsExpensesService) {}

  @Post()
  create(@Body() createGroupsExpenseDto: CreateGroupExpenseDto) {
    return this.groupsExpensesService.create(createGroupsExpenseDto);
  }

  @Get()
  findAll() {
    return this.groupsExpensesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.groupsExpensesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateGroupsExpenseDto: UpdateGroupsExpenseDto,
  ) {
    return this.groupsExpensesService.update(+id, updateGroupsExpenseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.groupsExpensesService.remove(+id);
  }
}
