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
  topic?: string; // default to env topic
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private readonly defaultTopic = process.env.FCM_DEFAULT_TOPIC || 'all-users';

  constructor(
    private prisma: PrismaService,
    @Inject('FIREBASE_ADMIN') private firebaseApp: admin.app.App,  // 👈 FIXED
  ) {}

  // 1) Token registration (optionally associate with user)
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

  // 2) Topic broadcast (best for “notify all users”)
  async broadcastToTopic(payload: BroadcastPayload) {
    const topic = payload.topic || this.defaultTopic;

    // Save in Notification table (for in-app feed)
    const notification = await this.prisma.notification.create({
      data: {
        title: payload.title,
        body: payload.body,
        imageUrl: payload.imageUrl,
        deepLink: payload.deepLink,
        contentType: payload.contentType,
        contentId: payload.contentId,
        sentToTopic: topic,
      },
    });

    // Send push
    const messaging = this.firebaseApp.messaging();
    await messaging.send({
      topic,
      notification: {
        title: payload.title,
        body: payload.body,
        image: payload.imageUrl, // ✅ supported in latest SDK
      } as any,
      data: {
        deepLink: payload.deepLink ?? '',
        contentType: payload.contentType,
        contentId: payload.contentId ?? '',
      },
      android: { priority: 'high' },
      apns: {
        payload: { aps: { sound: 'default', contentAvailable: true } },
      },
    });

    this.logger.log(`Broadcast sent to topic "${topic}"`);
    return { message: 'Broadcast sent', id: notification.id };
  }











  // 3) Optional: send to specific user(s)
  async sendToUserIds(userIds: string[], payload: Omit<BroadcastPayload, 'topic'>) {
    // Fetch tokens
    const tokens = await this.prisma.deviceToken.findMany({
      where: { userId: { in: userIds } },
      select: { token: true, userId: true },
    });

    if (!tokens.length) return { message: 'No tokens to send' };

    // Create notification & recipients (in-app feed)
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

    const messaging = this.firebaseApp.messaging();
    const tokenList = tokens.map(t => t.token);

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

  // 4) In-app feed (list + mark as read)
  async listMyNotifications(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    // Include topic notifications for everyone + user-specific ones
    // Strategy: show user-specific first; to show topic ones to everyone, you can either
    // replicate NotificationRecipient for all, or (lighter) fetch the topic notifications
    // and merge in the response. Here we fetch both.
    const [userSpecific, topicBased] = await Promise.all([
      this.prisma.notificationRecipient.findMany({
        where: { userId },
        include: { notification: true },
        orderBy: { notification: { createdAt: 'desc' } },
        skip, take: limit,
      }),
      this.prisma.notification.findMany({
        where: { sentToTopic: this.defaultTopic },
        orderBy: { createdAt: 'desc' },
        skip, take: limit,
      }),
    ]);

    // Merge and de-dupe by id, mark read state from recipients
    const merged = new Map<string, any>();

    for (const r of userSpecific) {
      merged.set(r.notificationId, {
        ...r.notification,
        readAt: r.readAt ?? null,
      });
    }

    for (const n of topicBased) {
      if (!merged.has(n.id)) {
        merged.set(n.id, { ...n, readAt: null });
      }
    }

    return Array.from(merged.values()).sort(
      (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
    );
  }

  async markRead(userId: string, notificationId: string) {
    // Create recipient if not exists (topic case), then mark read
    await this.prisma.notificationRecipient.upsert({
      where: { userId_notificationId: { userId, notificationId } },
      update: { readAt: new Date() },
      create: { userId, notificationId, readAt: new Date() },
    });
    return { message: 'Marked as read' };
  }
}
