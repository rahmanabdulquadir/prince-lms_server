import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { PaymentStatus } from '@prisma/client'; // ✅ Import PaymentStatus enum

@Injectable()
export class SubscriptionService {
  private stripe: Stripe;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    // ✅ Fixed: Use a valid Stripe API version (latest stable at time of writing)
    this.stripe = new Stripe(this.config.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2023-10-16' as any,
    });
  }

  async createCheckoutSession(dto: CreateSubscriptionDto) {
    const plan = await this.prisma.plan.findUnique({
      where: { id: dto.planId },
    });
    if (!plan) throw new BadRequestException('Plan not found');

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: plan.name },
            unit_amount: Math.round(plan.price * 100),
          },
          quantity: 1,
        },
      ],
      // ✅ metadata type is object of strings
      metadata: {
        planId: dto.planId,
        userId: dto.userId,
      },
      success_url: `${this.config.get('CLIENT_URL')}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${this.config.get('CLIENT_URL')}/cancel`,
    });

    return { url: session.url };
  }

  async handleWebhook(payload: Buffer, signature: string) {
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.config.get('STRIPE_WEBHOOK_SECRET')!,
      );
    } catch {
      throw new BadRequestException('Invalid Stripe webhook signature');
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      // ✅ Fix: Type-safe access to metadata
      const metadata = session.metadata as {
        planId: string;
        userId: string;
      } | null;

      if (!metadata?.planId || !metadata?.userId) {
        throw new BadRequestException('Missing metadata in session');
      }

      const { planId, userId } = metadata;
      const amount = (session.amount_total ?? 0) / 100;

      const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
      if (!plan) throw new NotFoundException('Plan not found');

      const durationDays = plan.planType === 'MONTHLY' ? 30 : 365;

      const sub = await this.prisma.subscription.create({
        data: {
          userId,
          planId,
          startDate: new Date(),
          endDate: new Date(Date.now() + durationDays * 864e5),
          payments: {
            create: {
              amount,
              currency: 'USD',
              status: PaymentStatus.SUCCESS, // ✅ Use enum value from Prisma
              transactionId: session.payment_intent as string,
            },
          },
        },
      });

      return sub;
    }

    return { received: true };
  }

  async findSubscriptions(userId: string) {
    return this.prisma.subscription.findMany({
      where: { userId },
      include: { plan: true, payments: true },
    });
  }
}
