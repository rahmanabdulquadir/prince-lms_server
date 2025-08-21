import { Inject, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as admin from 'firebase-admin';

interface BroadcastPayload {
  title: string;
  body: string;
  imageUrl?: string;
  deepLink?: string;
  contentType: 'video' | 'course' | 'system';
  contentId?: string;
  topic?: string; // not used now, we send to all tokens
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private prisma: PrismaService,
    @Inject('FIREBASE_ADMIN') private firebaseApp: admin.app.App,
  ) {}

  // 1) Token registration
  async registerToken(token: string, platform: string, userId?: string, locale?: string) {
    await this.prisma.deviceToken.upsert({
      where: { token },
      update: { platform, userId, locale },
      create: { token, platform, userId, locale },
    });
    return { message: 'Token registered' };
  }

  async unregisterToken(token: string) {
    await this.prisma.deviceToken.deleteMany({ where: { token } });
    return { message: 'Token unregistered' };
  }

  // 2) Broadcast to ALL device tokens (fix applied)
  async broadcastToAll(payload: BroadcastPayload) {
    // Fetch all tokens from DB
    const tokens = await this.prisma.deviceToken.findMany({ select: { token: true } });

    if (!tokens.length) {
      this.logger.warn('No device tokens found in DB');
      return { message: 'No tokens available' };
    }

    const tokenList = tokens.map((t) => t.token);

    // Save notification in DB (in-app feed)
    const notification = await this.prisma.notification.create({
      data: {
        title: payload.title,
        body: payload.body,
        imageUrl: payload.imageUrl,
        deepLink: payload.deepLink,
        contentType: payload.contentType,
        contentId: payload.contentId,
      },
    });

    const messaging = this.firebaseApp.messaging();

    // Send multicast
    const resp = await messaging.sendEachForMulticast({
      tokens: tokenList,
      notification: {
        title: payload.title,
        body: payload.body,
        image: payload.imageUrl,
      } as any,
      data: {
        deepLink: payload.deepLink ?? '',
        contentType: payload.contentType,
        contentId: payload.contentId ?? '',
      },
      android: { priority: 'high' },
      apns: { payload: { aps: { sound: 'default', contentAvailable: true } } },
    });

    this.logger.log(`Broadcast: success=${resp.successCount}, fail=${resp.failureCount}`);

    // ✅ Remove invalid tokens from DB
    if (resp.responses) {
      const invalidTokens: string[] = [];
      resp.responses.forEach((r, i) => {
        if (!r.success) {
          const error = (r.error as any)?.errorInfo?.code;
          if (error === 'messaging/invalid-argument' || error === 'messaging/registration-token-not-registered') {
            invalidTokens.push(tokenList[i]);
          }
        }
      });

      if (invalidTokens.length) {
        await this.prisma.deviceToken.deleteMany({ where: { token: { in: invalidTokens } } });
        this.logger.warn(`Removed ${invalidTokens.length} invalid tokens`);
      }
    }

    return { message: 'Broadcast sent', id: notification.id, ...resp };
  }

  // 3) Send to specific users
  async sendToUserIds(userIds: string[], payload: Omit<BroadcastPayload, 'topic'>) {
    const tokens = await this.prisma.deviceToken.findMany({
      where: { userId: { in: userIds } },
      select: { token: true, userId: true },
    });

    if (!tokens.length) return { message: 'No tokens to send' };

    const notification = await this.prisma.notification.create({
      data: {
        title: payload.title,
        body: payload.body,
        imageUrl: payload.imageUrl,
        deepLink: payload.deepLink,
        contentType: payload.contentType,
        contentId: payload.contentId,
        recipients: {
          create: userIds.map((uid) => ({ userId: uid })),
        },
      },
    });

    const tokenList = tokens.map((t) => t.token);
    const messaging = this.firebaseApp.messaging();

    const batchResp = await messaging.sendEachForMulticast({
      tokens: tokenList,
      notification: { title: payload.title, body: payload.body, image: payload.imageUrl } as any,
      data: {
        deepLink: payload.deepLink ?? '',
        contentType: payload.contentType,
        contentId: payload.contentId ?? '',
      },
      android: { priority: 'high' },
      apns: { payload: { aps: { sound: 'default' } } },
    });

    this.logger.log(`Multicast: success=${batchResp.successCount}, fail=${batchResp.failureCount}`);
    return { notificationId: notification.id, ...batchResp };
  }

  // 4) In-app feed
  async listMyNotifications(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [userSpecific, global] = await Promise.all([
      this.prisma.notificationRecipient.findMany({
        where: { userId },
        include: { notification: true },
        orderBy: { notification: { createdAt: 'desc' } },
        skip,
        take: limit,
      }),
      this.prisma.notification.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    const merged = new Map<string, any>();
    for (const r of userSpecific) {
      merged.set(r.notificationId, { ...r.notification, readAt: r.readAt ?? null });
    }
    for (const n of global) {
      if (!merged.has(n.id)) merged.set(n.id, { ...n, readAt: null });
    }

    return Array.from(merged.values()).sort(
      (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
    );
  }

  async markRead(userId: string, notificationId: string) {
    await this.prisma.notificationRecipient.upsert({
      where: { userId_notificationId: { userId, notificationId } },
      update: { readAt: new Date() },
      create: { userId, notificationId, readAt: new Date() },
    });
    return { message: 'Marked as read' };
  }
}
