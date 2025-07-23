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

@ApiTags('Quotes')
@Controller('quotes')
export class QuoteController {
  constructor(private readonly quoteService: QuoteService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new quote' })
  create(@Body() dto: CreateQuoteDto) {
    return this.quoteService.create(dto);
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
    const user = req as Request & { user?: { isSubscribed?: boolean } };
    const isSubscribed = user.user?.isSubscribed ?? false;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;

    return this.quoteService.findAll(isSubscribed, pageNum, limitNum);
  }
  
  @Get(':id')
  @ApiOperation({ summary: 'Get a single quote by ID' })
  findOne(@Param('id') id: string) {
    return this.quoteService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a quote by ID' })
  remove(@Param('id') id: string) {
    return this.quoteService.remove(id);
  }
}
