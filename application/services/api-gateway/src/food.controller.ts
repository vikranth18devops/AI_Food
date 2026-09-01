import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  UseGuards,
  Req,
  Res,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from './jwt-auth.guard';
import { PrismaService } from './prisma.service';
import { RabbitMQService } from './rabbitmq.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Response } from 'express';
import { generateCorrelationId, calculateNutritionForServingSize, StructuredLogger } from '@foodlens/shared-utils';
import { AnalysisStatus, EventType, ApiResponse, NutritionFactsDto } from '@foodlens/shared-types';
import { loadAppConfig } from '@foodlens/shared-config';

const config = loadAppConfig();

@ApiTags('Food Analysis')
@Controller('api/v1/food')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FoodGatewayController {
  private logger = new StructuredLogger('api-gateway:food');

  constructor(
    private prisma: PrismaService,
    private rabbitmq: RabbitMQService,
    private httpService: HttpService
  ) {}

  @Post('analyze')
  @ApiOperation({ summary: 'Upload food image & initiate AI recognition workflow' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  async analyzeFood(@Req() req: any, @UploadedFile() file: Express.Multer.File): Promise<ApiResponse> {
    if (!file) {
      throw new BadRequestException('Image file is required for analysis');
    }

    const userId = req.user.userId;
    const correlationId = generateCorrelationId();

    this.logger.info(`Initiating analysis for user ${userId}`, { correlationId });

    // Step 1: Forward image upload to Image Service
    let imageRecord: any;
    try {
      const imageServiceUrl = config.storagePath ? 'http://localhost:3002' : 'http://localhost:3002';
      const formData = new (require('form-data'))();
      formData.append('image', file.buffer, {
        filename: file.originalname || 'uploaded.jpg',
        contentType: file.mimetype || 'image/jpeg',
      });

      const uploadRes = await firstValueFrom(
        this.httpService.post(`${imageServiceUrl}/images/upload`, formData, {
          headers: {
            ...formData.getHeaders(),
            'x-user-id': userId,
          },
          timeout: 1000,
        })
      );
      imageRecord = uploadRes.data.data;
    } catch (err: any) {
      this.logger.error('Image Service upload failed', err);
      // Fallback local DB insert if Image Service is isolated or local
      const fileExt = file.originalname?.split('.').pop() || 'jpg';
      const safeFilename = `img_${Date.now()}_${Math.random().toString(36).substr(2, 6)}.${fileExt}`;
      const mockUrl = `/uploads/${safeFilename}`;
      
      const newImage = await this.prisma.foodImage.create({
        data: {
          userId,
          filename: safeFilename,
          originalName: file.originalname || 'upload.jpg',
          mimeType: file.mimetype || 'image/jpeg',
          sizeBytes: file.size || 1024,
          storagePath: `uploads/${safeFilename}`,
          url: mockUrl,
        },
      });
      imageRecord = newImage;
    }

    // Step 2: Create FoodAnalysis record in PENDING status
    const analysis = await this.prisma.foodAnalysis.create({
      data: {
        userId,
        imageId: imageRecord.id,
        status: AnalysisStatus.PENDING,
        servingGrams: 100,
      },
      include: {
        image: true,
      },
    });

    // Step 3: Publish FOOD_ANALYSIS_REQUESTED event to RabbitMQ
    const eventPayload = {
      correlationId,
      analysisId: analysis.id,
      userId,
      imageId: imageRecord.id,
      imageUrl: imageRecord.url,
      timestamp: new Date().toISOString(),
    };

    const published = await this.rabbitmq.publishEvent(EventType.FOOD_ANALYSIS_REQUESTED, eventPayload);

    // Save initial AnalysisEvent record for idempotency tracing
    await this.prisma.analysisEvent.create({
      data: {
        analysisId: analysis.id,
        eventType: EventType.FOOD_ANALYSIS_REQUESTED,
        stage: AnalysisStatus.PENDING,
        payload: eventPayload as any,
        correlationId,
      },
    });

    return {
      success: true,
      data: {
        analysisId: analysis.id,
        status: AnalysisStatus.PENDING,
        imageUrl: imageRecord.url,
        correlationId,
        publishedToQueue: published,
      },
      message: 'Food analysis request initiated successfully',
    };
  }

  @Get('analysis/:id')
  @ApiOperation({ summary: 'Retrieve analysis result by ID with optional serving size recalculation' })
  async getAnalysisResult(
    @Req() req: any,
    @Param('id') analysisId: string,
    @Query('servingGrams') servingGramsQuery?: string
  ): Promise<ApiResponse> {
    const userId = req.user.userId;

    const analysis = await this.prisma.foodAnalysis.findUnique({
      where: { id: analysisId },
      include: {
        image: true,
        identifiedFood: {
          include: {
            ingredients: true,
            nutritionFacts: true,
          },
        },
        healthAnalysis: {
          include: {
            claims: {
              include: {
                sources: true,
              },
            },
          },
        },
        youtubeVideos: true,
      },
    });

    if (!analysis) {
      throw new NotFoundException(`Analysis with ID ${analysisId} not found`);
    }

    if (analysis.userId !== userId) {
      throw new ForbiddenException('You do not have permission to view this analysis');
    }

    const selectedGrams = servingGramsQuery ? parseInt(servingGramsQuery, 10) : analysis.servingGrams || 100;

    let calculatedNutrition: NutritionFactsDto | null = null;
    if (analysis.identifiedFood?.nutritionFacts) {
      const baseFacts: NutritionFactsDto = {
        servingSize: analysis.identifiedFood.nutritionFacts.baseServingSize,
        calories: analysis.identifiedFood.nutritionFacts.calories,
        protein: analysis.identifiedFood.nutritionFacts.protein,
        carbohydrates: analysis.identifiedFood.nutritionFacts.carbohydrates,
        fat: analysis.identifiedFood.nutritionFacts.fat,
        saturatedFat: analysis.identifiedFood.nutritionFacts.saturatedFat,
        fiber: analysis.identifiedFood.nutritionFacts.fiber,
        sugar: analysis.identifiedFood.nutritionFacts.sugar,
        sodium: analysis.identifiedFood.nutritionFacts.sodium,
        source: analysis.identifiedFood.nutritionFacts.source,
        sourceUrl: analysis.identifiedFood.nutritionFacts.sourceUrl || undefined,
      };
      calculatedNutrition = calculateNutritionForServingSize(baseFacts, selectedGrams);
    }

    return {
      success: true,
      data: {
        id: analysis.id,
        userId: analysis.userId,
        status: analysis.status,
        imageUrl: analysis.image.url,
        imageId: analysis.imageId,
        createdAt: analysis.createdAt.toISOString(),
        updatedAt: analysis.updatedAt.toISOString(),
        errorMessage: analysis.errorMessage,
        servingSizeGrams: selectedGrams,
        identifiedFood: analysis.identifiedFood
          ? {
              foodName: analysis.identifiedFood.foodName,
              confidence: analysis.identifiedFood.confidence,
              possibleFoods: analysis.identifiedFood.possibleFoods as any,
              ingredients: analysis.identifiedFood.ingredients.map(i => i.name),
            }
          : null,
        nutritionFacts: analysis.identifiedFood?.nutritionFacts
          ? {
              servingSize: analysis.identifiedFood.nutritionFacts.baseServingSize,
              calories: analysis.identifiedFood.nutritionFacts.calories,
              protein: analysis.identifiedFood.nutritionFacts.protein,
              carbohydrates: analysis.identifiedFood.nutritionFacts.carbohydrates,
              fat: analysis.identifiedFood.nutritionFacts.fat,
              saturatedFat: analysis.identifiedFood.nutritionFacts.saturatedFat,
              fiber: analysis.identifiedFood.nutritionFacts.fiber,
              sugar: analysis.identifiedFood.nutritionFacts.sugar,
              sodium: analysis.identifiedFood.nutritionFacts.sodium,
              source: analysis.identifiedFood.nutritionFacts.source,
              sourceUrl: analysis.identifiedFood.nutritionFacts.sourceUrl || undefined,
            }
          : null,
        calculatedNutrition,
        healthAnalysis: analysis.healthAnalysis
          ? {
              benefits: analysis.healthAnalysis.benefits,
              concerns: analysis.healthAnalysis.concerns,
              pros: analysis.healthAnalysis.pros,
              cons: analysis.healthAnalysis.cons,
              allergens: analysis.healthAnalysis.allergens,
              dietaryCompatibility: analysis.healthAnalysis.dietaryCompatibility as any,
              recommendations: analysis.healthAnalysis.recommendations,
              disclaimer: analysis.healthAnalysis.disclaimer,
              claims: analysis.healthAnalysis.claims.map(c => ({
                id: c.id,
                claim: c.claim,
                category: c.category as any,
                sources: c.sources.map(s => ({
                  id: s.id,
                  name: s.name,
                  url: s.url,
                  sourceType: s.sourceType as any,
                  title: s.title,
                })),
              })),
            }
          : null,
        youtubeVideos: analysis.youtubeVideos.map(v => ({
          videoId: v.videoId,
          title: v.title,
          channelTitle: v.channelTitle,
          description: v.description,
          thumbnailUrl: v.thumbnailUrl,
          publishedAt: v.publishedAt,
          url: v.url,
        })),
      },
    };
  }

  @Get('history')
  @ApiOperation({ summary: 'Get user food analysis history with pagination' })
  async getHistory(
    @Req() req: any,
    @Query('page') pageStr = '1',
    @Query('limit') limitStr = '10'
  ): Promise<ApiResponse> {
    const userId = req.user.userId;
    const page = Math.max(1, parseInt(pageStr, 10));
    const limit = Math.min(50, Math.max(1, parseInt(limitStr, 10)));
    const skip = (page - 1) * limit;

    const [total, items] = await Promise.all([
      this.prisma.foodAnalysis.count({ where: { userId } }),
      this.prisma.foodAnalysis.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          image: true,
          identifiedFood: true,
        },
      }),
    ]);

    const formattedItems = items.map(item => ({
      id: item.id,
      status: item.status,
      imageUrl: item.image.url,
      foodName: item.identifiedFood?.foodName || 'Processing...',
      confidence: item.identifiedFood?.confidence || null,
      createdAt: item.createdAt.toISOString(),
    }));

    return {
      success: true,
      data: {
        items: formattedItems,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  @Delete('analysis/:id')
  @ApiOperation({ summary: 'Delete a food analysis by ID' })
  async deleteAnalysis(@Req() req: any, @Param('id') analysisId: string): Promise<ApiResponse> {
    const userId = req.user.userId;

    const analysis = await this.prisma.foodAnalysis.findUnique({
      where: { id: analysisId },
    });

    if (!analysis) {
      throw new NotFoundException(`Analysis ${analysisId} not found`);
    }

    if (analysis.userId !== userId) {
      throw new ForbiddenException('Unauthorized access to analysis');
    }

    await this.prisma.foodAnalysis.delete({
      where: { id: analysisId },
    });

    return {
      success: true,
      message: 'Analysis deleted successfully',
    };
  }

  @Get('analysis/:id/status')
  @ApiOperation({ summary: 'Real-time status tracking endpoint (SSE & JSON status fallback)' })
  async getStatus(
    @Req() req: any,
    @Res() res: Response,
    @Param('id') analysisId: string,
    @Query('sse') sseQuery?: string
  ) {
    const userId = req.user.userId;

    const analysis = await this.prisma.foodAnalysis.findUnique({
      where: { id: analysisId },
      select: { id: true, userId: true, status: true, errorMessage: true, updatedAt: true },
    });

    if (!analysis) {
      throw new NotFoundException('Analysis not found');
    }

    if (analysis.userId !== userId) {
      throw new ForbiddenException('Unauthorized access');
    }

    // If standard JSON query
    if (sseQuery !== 'true') {
      return res.json({
        success: true,
        data: {
          analysisId: analysis.id,
          status: analysis.status,
          errorMessage: analysis.errorMessage,
          updatedAt: analysis.updatedAt.toISOString(),
        },
      });
    }

    // Server-Sent Events (SSE) stream setup
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const sendEvent = (data: any) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    sendEvent({
      analysisId: analysis.id,
      status: analysis.status,
      message: `Current stage: ${analysis.status}`,
    });

    // Poll DB state every 300ms for SSE push until COMPLETED or FAILED
    const interval = setInterval(async () => {
      try {
        const updated = await this.prisma.foodAnalysis.findUnique({
          where: { id: analysisId },
          select: { status: true, errorMessage: true },
        });

        if (updated) {
          sendEvent({
            analysisId,
            status: updated.status,
            errorMessage: updated.errorMessage,
            message: `Status updated to ${updated.status}`,
          });

          if (updated.status === AnalysisStatus.COMPLETED || updated.status === AnalysisStatus.FAILED) {
            clearInterval(interval);
            res.end();
          }
        }
      } catch (e) {
        clearInterval(interval);
        res.end();
      }
    }, 300);

    req.on('close', () => {
      clearInterval(interval);
    });
  }

  @Get('analysis/:id/videos')
  @ApiOperation({ summary: 'Get YouTube video recommendations for an analysis' })
  async getVideos(@Req() req: any, @Param('id') analysisId: string): Promise<ApiResponse> {
    const userId = req.user.userId;
    const analysis = await this.prisma.foodAnalysis.findUnique({
      where: { id: analysisId },
      include: { youtubeVideos: true },
    });

    if (!analysis || analysis.userId !== userId) {
      throw new ForbiddenException('Unauthorized access');
    }

    return {
      success: true,
      data: analysis.youtubeVideos,
    };
  }
}
