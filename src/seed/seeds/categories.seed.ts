import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Category,
  CategoryType,
} from '../../categories/entities/category.entity';

@Injectable()
export class CategoriesSeed {
  private readonly logger = new Logger(CategoriesSeed.name);

  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  async seedSystemCategories(): Promise<void> {
    this.logger.log('Seeding system categories...');

    const systemCategories = [
      // Income categories
      {
        name: 'Salary',
        type: CategoryType.income,
        color: '#4CAF50',
        icon: '💰',
        isDefault: true,
      },
      {
        name: 'Freelance',
        type: CategoryType.income,
        color: '#8BC34A',
        icon: '💼',
        isDefault: true,
      },
      {
        name: 'Investment',
        type: CategoryType.income,
        color: '#CDDC39',
        icon: '📈',
        isDefault: true,
      },
      {
        name: 'Gift',
        type: CategoryType.income,
        color: '#FFC107',
        icon: '🎁',
        isDefault: true,
      },
      {
        name: 'Other Income',
        type: CategoryType.income,
        color: '#FF9800',
        icon: '💵',
        isDefault: true,
      },

      // Expense categories
      {
        name: 'Food & Dining',
        type: CategoryType.expense,
        color: '#F44336',
        icon: '🍔',
        isDefault: true,
      },
      {
        name: 'Transportation',
        type: CategoryType.expense,
        color: '#E91E63',
        icon: '🚗',
        isDefault: true,
      },
      {
        name: 'Shopping',
        type: CategoryType.expense,
        color: '#9C27B0',
        icon: '🛍️',
        isDefault: true,
      },
      {
        name: 'Entertainment',
        type: CategoryType.expense,
        color: '#673AB7',
        icon: '🎬',
        isDefault: true,
      },
      {
        name: 'Bills & Utilities',
        type: CategoryType.expense,
        color: '#3F51B5',
        icon: '💡',
        isDefault: true,
      },
      {
        name: 'Healthcare',
        type: CategoryType.expense,
        color: '#2196F3',
        icon: '🏥',
        isDefault: true,
      },
      {
        name: 'Education',
        type: CategoryType.expense,
        color: '#03A9F4',
        icon: '📚',
        isDefault: true,
      },
      {
        name: 'Travel',
        type: CategoryType.expense,
        color: '#00BCD4',
        icon: '✈️',
        isDefault: true,
      },
      {
        name: 'Housing',
        type: CategoryType.expense,
        color: '#009688',
        icon: '🏠',
        isDefault: true,
      },
      {
        name: 'Insurance',
        type: CategoryType.expense,
        color: '#4CAF50',
        icon: '🛡️',
        isDefault: true,
      },
      {
        name: 'Other Expenses',
        type: CategoryType.expense,
        color: '#8BC34A',
        icon: '📝',
        isDefault: true,
      },
    ];

    for (const cat of systemCategories) {
      const exists = await this.categoryRepo.findOne({
        where: { name: cat.name, isDefault: true },
      });

      if (!exists) {
        await this.categoryRepo.save(cat);
        this.logger.log(`Created category: ${cat.name}`);
      }
    }

    this.logger.log('System categories seeded successfully');
  }

  async createDefaultCategoriesForUser(userId: number): Promise<void> {
    this.logger.log(`Creating default categories for user ${userId}...`);

    // Get system categories
    const systemCategories = await this.categoryRepo.find({
      where: { isDefault: true, isActive: true },
    });

    // Create a copy for the user
    for (const systemCat of systemCategories) {
      const userCategoryExists = await this.categoryRepo.findOne({
        where: { name: systemCat.name, user_id: userId },
      });

      if (!userCategoryExists) {
        await this.categoryRepo.save({
          name: systemCat.name,
          type: systemCat.type,
          color: systemCat.color,
          icon: systemCat.icon,
          user_id: userId,
          isDefault: false,
          isActive: true,
        });
        this.logger.log(`Created user category: ${systemCat.name}`);
      }
    }

    this.logger.log(`Default categories created for user ${userId}`);
  }
}
