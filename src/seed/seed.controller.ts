// import {
//   Controller,
//   Post,
//   Delete,
//   HttpCode,
//   HttpStatus,
//   Logger,
// } from '@nestjs/common';
// import { SeedService } from './seed.service';

// @Controller('seed')
// export class SeedController {
//   private readonly logger = new Logger(SeedController.name);

//   constructor(private readonly seedService: SeedService) {}

//   // =====================================
//   // SEED ALL DATA
//   // =====================================
//   @Post('all')
//   @HttpCode(HttpStatus.OK)
//   async seedAllData() {
//     try {
//       this.logger.log('Starting database seeding process...');
//       await this.seedService.seedDatabase();
//       this.logger.log('Database seeding completed successfully');
//       return {
//         message: 'Database seeded successfully',
//         status: 'success',
//         timestamp: new Date().toISOString(),
//       };
//     } catch (error) {
//       this.logger.error(
//         `Database seeding failed: ${error.message}`,
//         error.stack,
//       );
//       throw error;
//     }
//   }

//   // =====================================
//   // SEED USERS ONLY
//   // =====================================
//   @Post('users')
//   @HttpCode(HttpStatus.OK)
//   async seedUsers() {
//     try {
//       this.logger.log('Starting user seeding process...');
//       await this.seedService.seedUsers();
//       this.logger.log('User seeding completed successfully');
//       return {
//         message: 'Users seeded successfully',
//         status: 'success',
//         timestamp: new Date().toISOString(),
//       };
//     } catch (error) {
//       this.logger.error(`User seeding failed: ${error.message}`, error.stack);
//       throw error;
//     }
//   }

//   // =====================================
//   // SEED CATEGORIES ONLY
//   // =====================================
//   @Post('categories')
//   @HttpCode(HttpStatus.OK)
//   async seedCategories() {
//     try {
//       this.logger.log('Starting category seeding process...');
//       await this.seedService.seedCategories();
//       this.logger.log('Category seeding completed successfully');
//       return {
//         message: 'Categories seeded successfully',
//         status: 'success',
//         timestamp: new Date().toISOString(),
//       };
//     } catch (error) {
//       this.logger.error(
//         `Category seeding failed: ${error.message}`,
//         error.stack,
//       );
//       throw error;
//     }
//   }

//   // =====================================
//   // SEED ACCOUNTS ONLY
//   // =====================================
//   @Post('accounts')
//   @HttpCode(HttpStatus.OK)
//   async seedAccounts() {
//     try {
//       this.logger.log('Starting account seeding process...');
//       await this.seedService.seedAccounts();
//       this.logger.log('Account seeding completed successfully');
//       return {
//         message: 'Accounts seeded successfully',
//         status: 'success',
//         timestamp: new Date().toISOString(),
//       };
//     } catch (error) {
//       this.logger.error(
//         `Account seeding failed: ${error.message}`,
//         error.stack,
//       );
//       throw error;
//     }
//   }

//   // =====================================
//   // SEED GROUPS ONLY
//   // =====================================
//   @Post('groups')
//   @HttpCode(HttpStatus.OK)
//   async seedGroups() {
//     try {
//       this.logger.log('Starting group seeding process...');
//       await this.seedService.seedGroups();
//       this.logger.log('Group seeding completed successfully');
//       return {
//         message: 'Groups seeded successfully',
//         status: 'success',
//         timestamp: new Date().toISOString(),
//       };
//     } catch (error) {
//       this.logger.error(`Group seeding failed: ${error.message}`, error.stack);
//       throw error;
//     }
//   }

//   // =====================================
//   // CLEAR DATABASE
//   // =====================================
//   @Delete('database')
//   @HttpCode(HttpStatus.OK)
//   async clearDatabase() {
//     try {
//       this.logger.log('Starting database clearing process...');
//       await this.seedService.clearDatabase();
//       this.logger.log('Database cleared successfully');
//       return {
//         message: 'Database cleared successfully',
//         status: 'success',
//         timestamp: new Date().toISOString(),
//       };
//     } catch (error) {
//       this.logger.error(
//         `Database clearing failed: ${error.message}`,
//         error.stack,
//       );
//       throw error;
//     }
//   }
// }
