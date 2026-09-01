import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from './prisma.service';

@ApiTags('System Health')
@Controller('api/v1/health')
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'System health check' })
  async checkHealth() {
    let dbStatus = 'UNKNOWN';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbStatus = 'HEALTHY';
    } catch (e: any) {
      dbStatus = 'UNHEALTHY';
    }

    return {
      status: 'OK',
      service: 'api-gateway',
      timestamp: new Date().toISOString(),
      dependencies: {
        database: dbStatus,
      },
    };
  }
}
