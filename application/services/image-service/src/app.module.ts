import { Module } from '@nestjs/common';
import { ImageController } from './image.controller';
import { ImageService } from './image.service';
import { LocalStorageProvider } from './storage/local-storage.provider';
import { PrismaService } from './prisma.service';

@Module({
  controllers: [ImageController],
  providers: [ImageService, LocalStorageProvider, PrismaService],
})
export class AppModule {}
