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
import { GroupsMembersModule } from './groups-members/groups-members.module';
import { GroupsExpensesModule } from './groups-expenses/groups-expenses.module';
import { ExpenseSplitsModule } from './expense-splits/expense-splits.module';
import { SettlementsModule } from './settlements/settlements.module';
import { FinancialGoalsModule } from './financial-goals/financial-goals.module';
import { NotificationsModule } from './notifications/notifications.module';
import { databaseConfig } from './database/database.config';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
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
    GroupsMembersModule,
    GroupsExpensesModule,
    ExpenseSplitsModule,
    SettlementsModule,
    FinancialGoalsModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
