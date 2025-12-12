// Clean seed service that delegates to individual seed classes
import { Logger } from '@nestjs/common';
import { CategoriesSeed } from './seeds/categories.seed';

export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly categoriesSeed: CategoriesSeed) {}

  async seedDatabase(): Promise<void> {
    this.logger.log('Starting database seeding...');

    try {
      // Seed system categories (run once)
      await this.categoriesSeed.seedSystemCategories();

      this.logger.log('Database seeding completed successfully');
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Database seeding failed: ${errorMessage}`, errorStack);
      throw error;
    }
  }

  async seedSystemCategories(): Promise<void> {
    this.logger.log('Seeding system categories...');
    await this.categoriesSeed.seedSystemCategories();
  }
}
