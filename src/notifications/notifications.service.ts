import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
  ) {}

  // Create notification
  async create(createDto: {
    user_id: number;
    type: NotificationType;
    title: string;
    message: string;
    action_url?: string;
  }): Promise<Notification> {
    const notification = this.notificationRepo.create(createDto);
    return this.notificationRepo.save<Notification>(notification);
  }

  // Get user notifications
  async findAll(
    user_id: number,
    unreadOnly: boolean = false,
  ): Promise<Notification[]> {
    let notifications: Notification[];

    if (unreadOnly) {
      notifications = await this.notificationRepo.find({
        where: { user_id: user_id, isRead: false },
        order: { createdAt: 'DESC' },
        take: 50, // Limit to recent 50
      });
    } else {
      notifications = await this.notificationRepo.find({
        where: { user_id: user_id },
        order: { createdAt: 'DESC' },
        take: 50, // Limit to recent 50
      });
    }

    return notifications;
  }

  // Mark as read
  async markAsRead(user_id: number, id: number): Promise<Notification> {
    const notification = await this.notificationRepo.findOne({
      where: { id, user_id: user_id },
    });

    if (!notification) {
      throw new NotFoundException(`Notification ${id} not found`);
    }

    notification.isRead = true;
    return this.notificationRepo.save(notification);
  }

  // Mark all as read
  async markAllAsRead(user_id: number): Promise<void> {
    await this.notificationRepo.update(
      { user_id: user_id, isRead: false },
      { isRead: true },
    );
  }

  // Get unread count
  async getUnreadCount(user_id: number): Promise<number> {
    return this.notificationRepo.count({
      where: { user_id: user_id, isRead: false },
    });
  }

  // Remove notification
  async remove(user_id: number, id: number): Promise<{ message: string }> {
    const notification = await this.notificationRepo.findOne({
      where: { id, user_id: user_id },
    });

    if (!notification) {
      throw new NotFoundException(`Notification ${id} not found`);
    }

    await this.notificationRepo.remove(notification);
    return { message: `Notification ${id} deleted successfully` };
  }
}
