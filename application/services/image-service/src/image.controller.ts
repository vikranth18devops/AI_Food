import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Headers,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageService } from './image.service';

@Controller('images')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Headers('x-user-id') userId: string
  ) {
    if (!userId) {
      throw new BadRequestException('x-user-id header is required');
    }
    const record = await this.imageService.uploadImage(file, userId);
    return {
      success: true,
      data: record,
      message: 'Image uploaded successfully',
    };
  }

  @Get(':id')
  async getImage(@Param('id') id: string) {
    const record = await this.imageService.getImage(id);
    return {
      success: true,
      data: record,
    };
  }

  @Delete(':id')
  async deleteImage(@Param('id') id: string, @Headers('x-user-id') userId: string) {
    return this.imageService.deleteImage(id, userId);
  }

  @Get('health')
  health() {
    return { status: 'OK', service: 'image-service', timestamp: new Date().toISOString() };
  }
}
