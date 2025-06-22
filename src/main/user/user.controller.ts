import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';

@ApiTags('User')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  getMe(@CurrentUser('id') userId: string) {
    return this.userService.getMe(userId);
  }

  @Get()
  @ApiBearerAuth()
  getAllUsers() {
    return this.userService.getAllUsers();
  }

  @Patch('me')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        fullName: { type: 'string', example: 'John Doe' },
        email: { type: 'string', format: 'email', example: 'john@example.com' },
        phoneNumber: { type: 'string', example: '1234567890' },
        file: {
          type: 'string',
          format: 'binary',
          description: 'Profile photo (optional)',
        },
      },
    },
  })
  updateMe(
    @CurrentUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UpdateUserDto,
  ) {
    return this.userService.updateMe(userId, dto, file);
  }
}
