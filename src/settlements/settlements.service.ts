import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Settlement } from './entities/settlement.entity';
import { Group } from '../groups/entities/group.entity';
import { RecurringSplit } from '../expense-splits/entities/expense-split.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';
import { CreateSettlementDto } from './dto/create-settlement.dto';
import { UpdateSettlementDto } from './dto/update-settlement.dto';

@Injectable()
export class SettlementsService {
  private readonly logger = new Logger(SettlementsService.name);

  constructor(
    @InjectRepository(Settlement)
    private readonly settlementRepo: Repository<Settlement>,
    @InjectRepository(RecurringSplit)
    private readonly splitRepo: Repository<RecurringSplit>,
    @InjectRepository(Group)
    private readonly groupRepo: Repository<Group>,
    private readonly notificationsService: NotificationsService,
  ) {}

  // Create settlement (mark debt as paid)
  async create(
    user_id: number,
    createDto: CreateSettlementDto,
  ): Promise<Settlement> {
    this.logger.log(`Creating settlement for user ${user_id}`);

    // Verify group exists
    const group = await this.groupRepo.findOne({
      where: { id: createDto.group_id },
    });

    if (!group)
      throw new NotFoundException(`Group ${createDto.group_id} not found`);

    // User must be the payer since no payee_id exists in entity
    if (createDto.payer_id !== user_id) {
      throw new BadRequestException(
        'You must be the payer to create a settlement',
      );
    }

    // Create settlement record
    const settlement = this.settlementRepo.create({
      ...createDto,
      date: new Date(),
    });

    const savedSettlement = await this.settlementRepo.save(settlement);

    // Settle related splits
    await this.markSplitsAsSettled(
      createDto.group_id,
      createDto.payer_id,
      createDto.amount,
    );

    // Notify payer about settlement confirmation
    await this.notificationsService.create({
      user_id: createDto.payer_id,
      type: NotificationType.settlement_request,
      title: 'Settlement Recorded',
      message: `Your payment of ${createDto.amount} has been recorded.`,
      action_url: `/groups/${createDto.group_id}/settlements`,
    });

    this.logger.log(`Settlement ${savedSettlement.id} created successfully`);
    return savedSettlement;
  }

  // Mark related splits as settled
  private async markSplitsAsSettled(
    groupId: number,
    payerId: number,
    amount: number,
  ): Promise<void> {
    const splits = await this.splitRepo
      .createQueryBuilder('split')
      .innerJoin('split.group_expense', 'expense')
      .where('expense.group_id = :groupId', { groupId })
      .andWhere('expense.paid_by_id = :payerId', {
        payerId: payerId,
      })
      .andWhere('split.is_settled = :isSettled', { isSettled: false })
      .getMany();

    let remainingAmount = amount;

    for (const split of splits) {
      const owed = Number(split.amountOwed) - Number(split.amountPaid);

      if (remainingAmount >= owed) {
        split.amountPaid = split.amountOwed;
        split.isSettled = true;
        split.settled_at = new Date();
        remainingAmount -= owed;
      } else {
        split.amountPaid = Number(split.amountPaid) + remainingAmount;
        remainingAmount = 0;
      }

      await this.splitRepo.save(split);

      if (remainingAmount === 0) break;
    }
  }

  // Get all settlements for a group
  async findAllByGroup(groupId: number): Promise<Settlement[]> {
    return this.settlementRepo.find({
      where: { group_id: groupId },
      order: { date: 'DESC' },
    });
  }

  // Get settlements for a user in a group
  async findUserSettlements(
    user_id: number,
    group_id: number,
  ): Promise<Settlement[]> {
    return this.settlementRepo
      .createQueryBuilder('settlement')
      .where('settlement.group_id = :groupId', { group_id })
      .andWhere('settlement.payer_id = :userId', { user_id }) // only payer exists
      .orderBy('settlement.date', 'DESC')
      .getMany();
  }

  // Settlement history — simplified since only payer_id exists
  async getSettlementHistory(groupId: number, userId: number) {
    const settlements = await this.settlementRepo
      .createQueryBuilder('settlement')
      .where('settlement.group_id = :groupId', { groupId })
      .andWhere('settlement.payer_id = :userId', { userId })
      .orderBy('settlement.date', 'DESC')
      .getMany();

    const total = settlements.reduce((sum, s) => sum + Number(s.amount), 0);

    return {
      settlements,
      total_paid: total,
      net_balance: total, // nothing to compare without payee
    };
  }

  // Update settlement
  async update(
    userId: number,
    id: number,
    updateDto: UpdateSettlementDto,
  ): Promise<Settlement> {
    const settlement = await this.settlementRepo.findOne({ where: { id } });

    if (!settlement) throw new NotFoundException(`Settlement ${id} not found`);

    // Only payer can update
    if (settlement.payer_id !== userId) {
      throw new BadRequestException(
        'You are not the payer for this settlement',
      );
    }

    Object.assign(settlement, updateDto);
    const savedSettlement = await this.settlementRepo.save(settlement);
    return savedSettlement;
  }

  // Delete settlement
  async remove(userId: number, id: number): Promise<{ message: string }> {
    const settlement = await this.settlementRepo.findOne({ where: { id } });

    if (!settlement) throw new NotFoundException(`Settlement ${id} not found`);

    if (settlement.payer_id !== userId) {
      throw new BadRequestException('Only the payer can delete a settlement');
    }

    await this.settlementRepo.remove(settlement);
    return { message: `Settlement ${id} deleted successfully` };
  }
}
