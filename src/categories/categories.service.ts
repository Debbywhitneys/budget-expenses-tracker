import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category, CategoryType } from './entities/category.entity';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  // Create custom category
  async create(
    user_id: number,
    createDto: Partial<Category>,
  ): Promise<Category> {
    const existing = await this.categoryRepo.findOne({
      where: { name: createDto.name, user_id },
    });

    if (existing) {
      throw new BadRequestException('Category with this name already exists');
    }

    const category = this.categoryRepo.create({
      ...createDto,
      user_id: user_id,
      isDefault: false,
    });

    return this.categoryRepo.save(category);
  }

  // Get all categories (system + user custom)
  async findAll(user_id: number, type?: CategoryType): Promise<Category[]> {
    const where: Array<{
      isDefault?: boolean;
      isActive?: boolean;
      type?: CategoryType;
      user_id?: number;
    }> = [
      { isDefault: true, isActive: true },
      { user_id, isActive: true },
    ];

    if (type) {
      where[0].type = type;
      where[1].type = type;
    }

    const categories = await this.categoryRepo.find({
      where,
      order: { isDefault: 'DESC', name: 'ASC' },
    });

    return categories;
  }

  // Get income categories only
  async getIncomeCategories(user_id: number): Promise<Category[]> {
    return this.findAll(user_id, CategoryType.income);
  }

  // Get expense categories only
  async getExpenseCategories(user_id: number): Promise<Category[]> {
    return this.findAll(user_id, CategoryType.expense);
  }

  // Get one category by ID
  async findOne(id: number): Promise<Category> {
    const category = await this.categoryRepo.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!category) {
      throw new NotFoundException(`Category ${id} not found`);
    }

    return category;
  }

  // Update custom category (cannot update system categories)
  async update(
    user_id: number,
    id: number,
    updateDto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.categoryRepo.findOne({
      where: { id, user_id },
    });

    if (!category) {
      throw new NotFoundException(`Category ${id} not found`);
    }

    if (category.isDefault) {
      throw new BadRequestException('Cannot update system categories');
    }

    Object.assign(category, updateDto);
    return await this.categoryRepo.save(category);
  }

  // Delete custom category (cannot delete system categories)
  async remove(user_id: number, id: number): Promise<{ message: string }> {
    const category = await this.categoryRepo.findOne({
      where: { id, user_id },
      relations: ['transactions'],
    });

    if (!category) {
      throw new NotFoundException(`Category ${id} not found`);
    }

    if (category.isDefault) {
      throw new BadRequestException('Cannot delete system categories');
    }

    if (category.transactions && category.transactions.length > 0) {
      throw new BadRequestException(
        'Cannot delete category with transactions. Deactivate it instead.',
      );
    }

    await this.categoryRepo.remove(category);
    return { message: `Category ${id} deleted successfully` };
  }

  // Deactivate category (soft delete)
  async deactivate(user_id: number, id: number): Promise<Category> {
    const category = await this.categoryRepo.findOne({
      where: { id, user_id },
    });

    if (!category) {
      throw new NotFoundException(`Category ${id} not found`);
    }

    if (category.isDefault) {
      throw new BadRequestException('Cannot deactivate system categories');
    }

    category.isActive = false;
    await this.categoryRepo.save(category);
    return category;
  }
}
