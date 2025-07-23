import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { QuoteService } from './quote.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
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
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all quotes' })
  findAll(@Req() req: Request) {
    const user = req as Request & { user?: { isSubscribed?: boolean } };
    const isSubscribed = user.user?.isSubscribed ?? false;
    return this.quoteService.findAll(isSubscribed);
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
