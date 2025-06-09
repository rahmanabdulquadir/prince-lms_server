import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { TermsService } from './terms.service';
import { CreateTermsCategoryDto } from './dto/create-terms-category.dto';
import { CreateKeyPointDto } from './dto/create-key-point.dto';

@Controller('terms')
export class TermsController {
  constructor(private termsService: TermsService) {}

  @Post('category')
  createCategory(@Body() dto: CreateTermsCategoryDto) {
    return this.termsService.createCategory(dto);
  }

  @Get('categories')
  getAllCategories() {
    return this.termsService.getAllCategories();
  }

  @Post('key-point')
  createKeyPoint(@Body() dto: CreateKeyPointDto) {
    return this.termsService.createKeyPoint(dto);
  }

  @Get('category/:id/key-points')
  getKeyPoints(@Param('id') id: string) {
    return this.termsService.getKeyPointsByCategory(id);
  }

  @Delete('category/:id')
  deleteCategory(@Param('id') id: string) {
    return this.termsService.deleteCategory(id);
  }

  @Delete('key-point/:id')
  deleteKeyPoint(@Param('id') id: string) {
    return this.termsService.deleteKeyPoint(id);
  }
}
