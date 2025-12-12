import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FinancialGoal } from './entities/financial-goal.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';
import { CreateFinancialGoalDto } from './dto/create-financial-goal.dto';
import { UpdateFinancialGoalDto } from './dto/update-financial-goal.dto';

// Type for goal with progress
export interface GoalWithProgress extends FinancialGoal {
  progress_percentage: number;
  remaining_amount: number;
  days_remaining: number | null;
}

// Type for goal statistics
export interface GoalStatistics {
  total_goals: number;
  completed_goals: number;
  active_goals: number;
  total_target: number;
  total_saved: number;
  overall_progress: number;
}

@Injectable()
export class FinancialGoalsService {
  private readonly logger = new Logger(FinancialGoalsService.name);

  constructor(
    @InjectRepository(FinancialGoal)
    private readonly goalRepo: Repository<FinancialGoal>,
    private readonly notificationsService: NotificationsService,
  ) {}

  // Create goal
  async create(
    userId: number,
    createDto: CreateFinancialGoalDto,
  ): Promise<FinancialGoal> {
    const goal = this.goalRepo.create({
      user_id: userId,
      ...createDto,
      currentAmount: 0,
    });

    const savedGoal = await this.goalRepo.save(goal);
    return Array.isArray(savedGoal) ? savedGoal[0] : savedGoal;
  }

  // Get all goals with progress
  async findAll(userId: number): Promise<GoalWithProgress[]> {
    const goals = await this.goalRepo.find({
      where: { user_id: userId },
      order: { createdAt: 'ASC' },
    });

    return goals.map((goal) => ({
      ...goal,
      progress_percentage:
        (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100,
      remaining_amount: Number(goal.targetAmount) - Number(goal.currentAmount),
      days_remaining: goal.deadline
        ? Math.ceil(
            (new Date(goal.deadline).getTime() - new Date().getTime()) /
              (1000 * 60 * 60 * 24),
          )
        : null,
    }));
  }

  // Allocate amount to goal
  async allocateToGoal(
    userId: number,
    goalId: number,
    amount: number,
  ): Promise<FinancialGoal> {
    const goal = await this.goalRepo.findOne({
      where: { id: goalId, user_id: userId },
    });

    if (!goal) {
      throw new NotFoundException(`Goal ${goalId} not found`);
    }

    const newAmount = Number(goal.currentAmount) + amount;
    goal.currentAmount = newAmount;

    // Check milestones
    await this.checkMilestones(goal);

    const savedGoal = await this.goalRepo.save(goal);
    return Array.isArray(savedGoal) ? savedGoal[0] : savedGoal;
  }

  // Check goal milestones
  private async checkMilestones(goal: FinancialGoal): Promise<void> {
    const progress =
      (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100;
    const milestones = [25, 50, 75, 100];

    for (const milestone of milestones) {
      if (progress >= milestone && progress < milestone + 5) {
        await this.notificationsService.create({
          user_id: goal.user_id,
          type: NotificationType.goal_milestone,
          title: 'Goal Milestone Achieved!',
          message: `You've reached ${milestone}% of your goal: ${goal.description}`,
          action_url: `/goals/${goal.id}`,
        });
      }
    }
  }

  // Get goal statistics
  async getStatistics(userId: number): Promise<GoalStatistics> {
    const goals = await this.goalRepo.find({
      where: { user_id: userId },
    });

    const totalTargetAmount = goals.reduce(
      (sum, g) => sum + Number(g.targetAmount),
      0,
    );
    const totalCurrentAmount = goals.reduce(
      (sum, g) => sum + Number(g.currentAmount),
      0,
    );
    const completedGoals = goals.filter(
      (g) => Number(g.currentAmount) >= Number(g.targetAmount),
    ).length;

    return {
      total_goals: goals.length,
      completed_goals: completedGoals,
      active_goals: goals.length - completedGoals,
      total_target: totalTargetAmount,
      total_saved: totalCurrentAmount,
      overall_progress: (totalCurrentAmount / totalTargetAmount) * 100,
    };
  }

  // Get one goal
  async findOne(userId: number, id: number): Promise<FinancialGoal> {
    const goal = await this.goalRepo.findOne({
      where: { id, user_id: userId },
    });

    if (!goal) {
      throw new NotFoundException(`Goal ${id} not found`);
    }

    return goal;
  }

  // Update goal
  async update(
    userId: number,
    id: number,
    updateDto: UpdateFinancialGoalDto,
  ): Promise<FinancialGoal> {
    const goal = await this.findOne(userId, id);
    Object.assign(goal, updateDto);
    const updatedGoal = await this.goalRepo.save(goal);
    return Array.isArray(updatedGoal) ? updatedGoal[0] : updatedGoal;
  }

  // Delete goal
  async remove(userId: number, id: number): Promise<{ message: string }> {
    const goal = await this.findOne(userId, id);
    await this.goalRepo.remove(goal);
    return { message: `Goal ${id} deleted successfully` };
  }
}
