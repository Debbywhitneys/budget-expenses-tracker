import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // =====================================
  // CREATE USER
  // =====================================
  @ApiOperation({ summary: 'Create a new user' })
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // =====================================
  // FIND ALL USERS
  // =====================================
  @ApiOperation({ summary: 'Get all users' })
  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  // =====================================
  // FIND ONE
  // =====================================
  @ApiOperation({ summary: 'Get a user by ID' })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  // =====================================
  // UPDATE USER
  // =====================================
  @ApiOperation({ summary: 'Update a user by ID' })
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  // =====================================
  // DELETE USER
  // =====================================
  @ApiOperation({ summary: 'Delete a user by ID' })
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
