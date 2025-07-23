import { Injectable } from '@nestjs/common';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QuoteService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateQuoteDto) {
    return this.prisma.quote.create({
      data: {
        quote: dto.quote,
        author: dto.author,
      },
    });
  }

findAll(isSubscribed: boolean) {
  return this.prisma.quote.findMany({
    orderBy: { createdAt: 'desc' },
    ...(isSubscribed ? {} : { take: 3 }),
  });
}

  findOne(id: string) {
    return this.prisma.quote.findUnique({ where: { id } });
  }

  remove(id: string) {
    return this.prisma.quote.delete({ where: { id } });
  }
}
