import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { LocalStorageProvider } from './storage/local-storage.provider';
import { PrismaService } from './prisma.service';
import { StructuredLogger } from '@foodlens/shared-utils';

@Injectable()
export class ImageService {
  private logger = new StructuredLogger('image-service');
  private allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

  constructor(
    private storageProvider: LocalStorageProvider,
    private prisma: PrismaService
  ) {}

  async uploadImage(file: Express.Multer.File, userId: string) {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(`Invalid image format ${file.mimetype}. Allowed: JPEG, PNG, WEBP`);
    }

    const maxSizeBytes = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSizeBytes) {
      throw new BadRequestException('File size exceeds maximum limit of 10MB');
    }

    const saved = await this.storageProvider.saveFile(file.buffer, file.originalname, file.mimetype);

    const record = await this.prisma.foodImage.create({
      data: {
        userId,
        filename: saved.filename,
        originalName: file.originalname || saved.filename,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        storagePath: saved.storagePath,
        url: saved.url,
      },
    });

    this.logger.info(`Uploaded image ${record.id} for user ${userId}`, { filename: saved.filename });
    return record;
  }

  async getImage(id: string) {
    const record = await this.prisma.foodImage.findUnique({ where: { id } });
    if (!record) {
      throw new NotFoundException(`Image with ID ${id} not found`);
    }
    return record;
  }

  async deleteImage(id: string, userId: string) {
    const record = await this.prisma.foodImage.findUnique({ where: { id } });
    if (!record) {
      throw new NotFoundException(`Image with ID ${id} not found`);
    }

    if (record.userId !== userId) {
      throw new BadRequestException('Unauthorized image deletion');
    }

    await this.storageProvider.deleteFile(record.storagePath);
    await this.prisma.foodImage.delete({ where: { id } });

    return { success: true, message: 'Image deleted successfully' };
  }
}
