import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { AccountsModule } from './accounts/accounts.module';
import { TransactionsModule } from './transactions/transactions.module';
import { BudgetsModule } from './budgets/budgets.module';
import { RecurringTransactionsModule } from './recurring-transactions/recurring-transactions.module';
import { GroupsModule } from './groups/groups.module';
import { GroupMembersModule } from './groups-members/groups-members.module';
import { GroupExpensesModule } from './groups-expenses/groups-expenses.module';
import { ExpenseSplitsModule } from './expense-splits/expense-splits.module';
import { SettlementsModule } from './settlements/settlements.module';
import { FinancialGoalsModule } from './financial-goals/financial-goals.module';
import { NotificationsModule } from './notifications/notifications.module';
import { databaseConfig } from './database/database.config';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/strategies/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './auth/guards/roles.guards';
import { AccessTokenGuard } from './auth/guards/access-token.guards';
import { LoggerModule } from './logger/logger.module';

// import { SeedModule } from './seed/seed.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [databaseConfig],
    }),
    DatabaseModule,
    UsersModule,
    CategoriesModule,
    AccountsModule,
    TransactionsModule,
    BudgetsModule,
    RecurringTransactionsModule,
    GroupsModule,
    GroupMembersModule,
    GroupExpensesModule,
    ExpenseSplitsModule,
    SettlementsModule,
    FinancialGoalsModule,
    NotificationsModule,
    AuthModule,
    LoggerModule,
    // SeedModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
