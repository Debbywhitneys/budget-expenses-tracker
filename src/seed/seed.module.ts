import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { CategoriesSeed } from './seeds/categories.seed';
import { Category } from '../categories/entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Category])],
  providers: [SeedService, CategoriesSeed],
  exports: [SeedService],
})
export class SeedModule {}
