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
import { CategoriesService } from './categories.service';
import { AccessTokenGuard } from '../auth/guards/access-token.guards';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
@UseGuards(AccessTokenGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Request() req, @Body() createDto: CreateCategoryDto) {
    return this.categoriesService.create(req.user.user_id, createDto);
  }

  @Get()
  findAll(@Request() req, @Query('type') type?: string) {
    return this.categoriesService.findAll(req.user.user_id, type as any);
  }

  @Get('income')
  getIncomeCategories(@Request() req) {
    return this.categoriesService.getIncomeCategories(req.user.user_id);
  }

  @Get('expense')
  getExpenseCategories(@Request() req) {
    return this.categoriesService.getExpenseCategories(req.user.user_id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(req.user.user_id, id, updateDto);
  }

  @Patch(':id/deactivate')
  deactivate(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.deactivate(req.user.user_id, id);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.remove(req.user.user_id, id);
  }
}
