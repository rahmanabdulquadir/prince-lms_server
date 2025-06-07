import {
    Controller,
    Post,
    Get,
    Param,
    Body,
    Delete,
  } from '@nestjs/common';
  import { ContactService } from './contact.service';
  import { CreateContactDto } from './dto/create-contact.dto';
  import { ApiTags, ApiOperation } from '@nestjs/swagger';
  
  @ApiTags('Contact')
  @Controller('contact')
  export class ContactController {
    constructor(private readonly contactService: ContactService) {}
  
    @Post()
    @ApiOperation({ summary: 'Submit a contact opinion' })
    create(@Body() dto: CreateContactDto) {
      return this.contactService.create(dto);
    }
  
    @Get()
    @ApiOperation({ summary: 'Get all contact opinions' })
    findAll() {
      return this.contactService.findAll();
    }
  
    @Get(':id')
    @ApiOperation({ summary: 'Get a contact opinion by ID' })
    findOne(@Param('id') id: string) {
      return this.contactService.findOne(id);
    }
  
    @Delete(':id')
    @ApiOperation({ summary: 'Delete a contact opinion by ID' })
    remove(@Param('id') id: string) {
      return this.contactService.remove(id);
    }
  }
  