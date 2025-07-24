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

  async findAll(
    isSubscribed: boolean,
    isAdmin: boolean,
    page = 1,
    limit = 10,
    userId?: string,
  ) {
    const take = isAdmin || isSubscribed ? limit : 3;
    const skip = (page - 1) * take;

    const quotes = await this.prisma.quote.findMany({
      take,
      skip,
      orderBy: { createdAt: 'desc' },
    });

    let savedQuoteIds: string[] = [];

    if (userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          SavedQuotes: {
            select: {
              quoteId: true, // ✅ Correct field
            },
          },
        },
      });

      savedQuoteIds = user?.SavedQuotes.map((quote) => quote.quoteId) ?? []; // ✅ Corrected mapping
    } else {
      console.log('⚠️ No userId provided, skipping saved quotes check.');
    }

    const quotesWithIsSaved = quotes.map((quote) => {
      const isSaved = savedQuoteIds.includes(quote.id); // ✅ Will now work correctly

      return {
        ...quote,
        isSaved,
      };
    });

    return quotesWithIsSaved;
  }

  findOne(id: string) {
    return this.prisma.quote.findUnique({ where: { id } });
  }

  remove(id: string) {
    return this.prisma.quote.delete({ where: { id } });
  }

  async saveQuote(quoteId: string, userId: string) {
    const alreadySaved = await this.prisma.savedQuote.findUnique({
      where: {
        userId_quoteId: {
          userId,
          quoteId,
        },
      },
    });

    if (alreadySaved) {
      return { message: 'Quote already saved' };
      // throw new Error('Quote already saved');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        SavedQuotes: {
          create: {
            quote: { connect: { id: quoteId } },
          },
        },
      },
    });

    return {
      SavedQuotes: await this.prisma.savedQuote.findMany({
        where: { userId },
        select: {
          id: true,
          quoteId: true,
          savedAt: true,
        },
      }),
    };
  }
  async unsaveQuote(quoteId: string, userId: string) {
    await this.prisma.user.update({
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
    });

    // Return updated SavedQuotes
    return this.prisma.savedQuote.findMany({
      where: { userId },
      select: {
        id: true,
        quoteId: true,
        savedAt: true,
      },
    });
  }
}
