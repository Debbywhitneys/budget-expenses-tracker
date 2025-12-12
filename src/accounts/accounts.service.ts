import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Account } from './entities/account.entity';
import {
  Transaction,
  TransactionType,
} from '../transactions/entities/transaction.entity';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@Injectable()
export class AccountsService {
  private readonly logger = new Logger(AccountsService.name);

  constructor(
    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,
    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,
  ) {}

  // Create account
  async create(userId: number, createDto: CreateAccountDto): Promise<Account> {
    const account = this.accountRepo.create({
      ...createDto,
      user_id: userId,
      current_balance: createDto.initial_balance || 0,
    });
    const savedAccount = await this.accountRepo.save(account);
    return Array.isArray(savedAccount) ? savedAccount[0] : savedAccount;
  }

  // Get all accounts for user
  async findAll(userId: number, includeInactive = false): Promise<Account[]> {
    const where: FindOptionsWhere<Account> = { user_id: userId };
    if (!includeInactive) {
      where.isActive = true;
    }
    return this.accountRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  // Get account with transaction history
  async findOneWithTransactions(userId: number, id: number): Promise<Account> {
    const account = await this.accountRepo.findOne({
      where: { id, user_id: userId },
      relations: ['transactions'],
    });

    if (!account) {
      throw new NotFoundException(`Account ${id} not found`);
    }

    return account;
  }

  // Manual balance adjustment
  async adjustBalance(
    userId: number,
    id: number,
    newBalance: number,
    reason: string,
  ): Promise<Account> {
    const account = await this.accountRepo.findOne({
      where: { id, user_id: userId },
    });

    if (!account) {
      throw new NotFoundException(`Account ${id} not found`);
    }

    const oldBalance = Number(account.current_balance);
    const difference = newBalance - oldBalance;

    // Create adjustment transaction
    await this.transactionRepo.save({
      user_id: userId,
      account_id: id,
      type: difference > 0 ? TransactionType.income : TransactionType.expense,
      amount: Math.abs(difference),
      description: `Balance adjustment: ${reason}`,
      notes: `Previous balance: ${oldBalance}, New balance: ${newBalance}`,
    });

    account.current_balance = newBalance;
    const savedAccount = await this.accountRepo.save(account);
    return Array.isArray(savedAccount) ? savedAccount[0] : savedAccount;
  }

  // Get total balance across all accounts
  async getTotalBalance(userId: number): Promise<{
    total: number;
    byAccount: Array<{ name: string; type: string; balance: number }>;
  }> {
    const accounts = await this.findAll(userId);

    const total = accounts.reduce(
      (sum, acc) => sum + Number(acc.current_balance),
      0,
    );

    const byAccount = accounts.map((acc) => ({
      name: acc.name,
      type: acc.type,
      balance: Number(acc.current_balance),
    }));

    return { total, byAccount };
  }

  // Archive account (soft delete)
  async archive(userId: number, id: number): Promise<Account> {
    const account = await this.accountRepo.findOne({
      where: { id, user_id: userId },
    });

    if (!account) {
      throw new NotFoundException(`Account ${id} not found`);
    }

    account.isActive = false;
    const savedAccount = await this.accountRepo.save(account);
    return Array.isArray(savedAccount) ? savedAccount[0] : savedAccount;
  }

  // Update account
  async update(
    userId: number,
    id: number,
    updateDto: UpdateAccountDto,
  ): Promise<Account> {
    const account = await this.accountRepo.findOne({
      where: { id, user_id: userId },
    });

    if (!account) {
      throw new NotFoundException(`Account ${id} not found`);
    }

    Object.assign(account, updateDto);
    const savedAccount = await this.accountRepo.save(account);
    return Array.isArray(savedAccount) ? savedAccount[0] : savedAccount;
  }

  // Delete account (only if no transactions)
  async remove(userId: number, id: number): Promise<{ message: string }> {
    const account = await this.findOneWithTransactions(userId, id);

    if (account.transactions && account.transactions.length > 0) {
      throw new BadRequestException(
        'Cannot delete account with transactions. Archive it instead.',
      );
    }

    await this.accountRepo.remove(account);
    return { message: `Account ${id} deleted successfully` };
  }
}
