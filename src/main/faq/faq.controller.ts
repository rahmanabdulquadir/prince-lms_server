import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { FAQService } from './faq.service';
import { CreateFAQCategoryDto } from './dto/create-faq-category.dto';
import { CreateFAQDto } from './dto/create-faq-dto';

@Controller('faq')
export class FAQController {
  constructor(private faqService: FAQService) {}

  @Post('category')
  createCategory(@Body() dto: CreateFAQCategoryDto) {
    return this.faqService.createCategory(dto);
  }

  @Get('categories')
  getAllCategories() {
    return this.faqService.findAllCategories();
  }

  @Post()
  createFAQ(@Body() dto: CreateFAQDto) {
    return this.faqService.createFAQ(dto);
  }

  @Get()
  getAllFAQs() {
    return this.faqService.findAllFAQs();
  }

  @Get('category/:id')
  getFAQsByCategory(@Param('id') id: string) {
    return this.faqService.findFAQsByCategory(id);
  }

  @Delete(':id')
  deleteFAQ(@Param('id') id: string) {
    return this.faqService.deleteFAQ(id);
  }

  @Delete('category/:id')
  deleteCategory(@Param('id') id: string) {
    return this.faqService.deleteCategory(id);
  }
}
