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

  findAll(isSubscribed: boolean, isAdmin: boolean, page = 1, limit = 10) {
    const take = isAdmin || isSubscribed ? limit : 3;
    const skip = (page - 1) * take;
  
    return this.prisma.quote.findMany({
      take,
      skip,
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.quote.findUnique({ where: { id } });
  }

  remove(id: string) {
    return this.prisma.quote.delete({ where: { id } });
  }

  async saveQuote(quoteId: string, userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        SavedQuotes: {
          create: {
            quote: { connect: { id: quoteId } },
          },
        },
      },
      include: { SavedQuotes: true },
    });
  }
  
  async unsaveQuote(quoteId: string, userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        SavedQuotes: {
          delete: {
            userId_quoteId: {
              userId,
              quoteId,
            },
          },
        },
      },
      include: { SavedQuotes: true },
    });
  }
  
}
