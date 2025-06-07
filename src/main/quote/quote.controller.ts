import {
    Controller,
    Post,
    Get,
    Delete,
    Param,
    Body,
  } from '@nestjs/common';
  import { QuoteService } from './quote.service';
  import { CreateQuoteDto } from './dto/create-quote.dto';
  import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
  
  @ApiTags('Quotes')
  @Controller('quotes')
  export class QuoteController {
    constructor(private readonly quoteService: QuoteService) {}
  
    @Post()
    @ApiOperation({ summary: 'Create a new quote' })
    create(@Body() dto: CreateQuoteDto) {
      return this.quoteService.create(dto);
    }
  
    @Get()
    @ApiOperation({ summary: 'Get all quotes' })
    findAll() {
      return this.quoteService.findAll();
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
  