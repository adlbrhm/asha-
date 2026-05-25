import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getNotifications(currentUser: { id: string; role: string; phcId?: string }) {
    const notifications = [];

    if (currentUser.role === 'DOCTOR') {
      if (!currentUser.phcId) return [];

      const redPatients = await this.prisma.screening.count({
        where: {
          phcId: currentUser.phcId,
          riskLevel: 'RED',
          status: { in: ['NEW', 'FOLLOW_UP'] },
        }
      });

      if (redPatients > 0) {
        notifications.push({
          id: 'red_pending',
          title: 'Critical Patients Pending',
          description: `${redPatients} RED patients pending clinical review`,
          timestamp: new Date().toISOString(),
          severity: 'Critical',
          action: 'triage',
        });
      }

      const followUps = await this.prisma.followUp.count({
        where: {
          doctorId: currentUser.id,
          status: 'PENDING',
        }
      });

      if (followUps > 0) {
        notifications.push({
          id: 'followups_due',
          title: 'Follow-Ups Due',
          description: `${followUps} follow-ups are due today`,
          timestamp: new Date().toISOString(),
          severity: 'Follow-Up',
          action: 'followups',
        });
      }
    }

    if (currentUser.role === 'ADMIN') {
      const syncScreenings = await this.prisma.screening.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      });

      if (syncScreenings > 0) {
        notifications.push({
          id: 'sync_completed',
          title: 'Sync Completed',
          description: `ASHA workers synced ${syncScreenings} screenings in the last 24h`,
          timestamp: new Date().toISOString(),
          severity: 'Sync',
          action: 'activity',
        });
      }

      const highBurdenScreenings = await this.prisma.screening.count({
        where: { riskLevel: 'RED', status: { not: 'RESOLVED' } }
      });

      if (highBurdenScreenings >= 5) {
        notifications.push({
          id: 'high_burden',
          title: 'Burden Increased',
          description: `Multiple PHCs have increased RED burden`,
          timestamp: new Date().toISOString(),
          severity: 'Operational',
          action: 'heatmap',
        });
      }
    }

    return notifications;
  }
}
