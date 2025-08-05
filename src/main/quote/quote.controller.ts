import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { QuoteService } from './quote.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from 'src/common/guard/AdminGuard';

@ApiTags('Quotes')
@Controller('quotes')
export class QuoteController {
  constructor(private readonly quoteService: QuoteService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new quote' })
  create(@Body() dto: CreateQuoteDto) {
    return this.quoteService.create(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('saved')
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiOperation({ summary: 'Get all saved quotes for the user (paginated)' })
  @ApiBearerAuth()
  getSavedQuotes(
    @Req() req: any,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    const userId = req.user?.id;
    return this.quoteService.getSavedQuotes(
      userId,
      Number(page),
      Number(limit),
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Get all quotes with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  findAll(
    @Req() req: Request,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    const user = req as Request & {
      user?: {
        id?: string;
        email?: string;
        role?: string;
        isSubscribed?: boolean;
      };
    };

    const userId = user.user?.id;
    const isSubscribed = user.user?.isSubscribed ?? false;
    const isAdmin = user.user?.role === 'ADMIN';

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;

    return this.quoteService.findAll(
      isSubscribed,
      isAdmin,
      pageNum,
      limitNum,
      userId,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single quote by ID' })
  findOne(@Param('id') id: string) {
    return this.quoteService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/save')
  @ApiOperation({ summary: 'Save a quote to user’s profile' })
  @ApiBearerAuth()
  saveQuote(@Param('id') quoteId: string, @Req() req: any) {
    return this.quoteService.saveQuote(quoteId, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/unsave')
  @ApiOperation({ summary: 'Unsave a quote from user’s profile' })
  @ApiBearerAuth()
  unsaveQuote(@Param('id') quoteId: string, @Req() req: any) {
    return this.quoteService.unsaveQuote(quoteId, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a quote by ID' })
  remove(@Param('id') id: string) {
    return this.quoteService.remove(id);
  }
}
