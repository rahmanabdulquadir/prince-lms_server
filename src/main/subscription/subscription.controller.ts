import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  Get,
  Query,
  Headers,
} from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { Request } from 'express';

interface RawBodyRequest extends Request {
  rawBody: Buffer;
}

@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly svc: SubscriptionService) {}

  @Post('checkout')
  createCheckout(@Body() dto: CreateSubscriptionDto) {
    return this.svc.createCheckoutSession(dto);
  }

  @Post('webhook')
  async webhook(
    @Req() req: RawBodyRequest,
    @Res() res,
    @Headers('stripe-signature') sig: string,
  ) {
    console.log('Stripe signature header:', sig);
    console.log('Raw body length:', req.rawBody?.length);
    try {
      await this.svc.handleWebhook(req.rawBody, sig);
      res.json({ received: true });
    } catch (err) {
      res.status(400).send(err.message);
    }
  }

  @Get('payments')
  getAllPayments() {
    return this.svc.findAllPayments();
  }

  @Get()
  getUserSubscriptions(@Query('userId') userId: string) {
    return this.svc.findSubscriptions(userId);
  }
}
