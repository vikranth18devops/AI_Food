import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthGatewayController } from './auth.controller';
import { FoodGatewayController } from './food.controller';
import { HealthController } from './health.controller';
import { JwtStrategy } from './jwt.strategy';
import { PrismaService } from './prisma.service';
import { RabbitMQService } from './rabbitmq.service';

@Module({
  imports: [
    HttpModule,
    PassportModule,
    JwtModule.register({}),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
  ],
  controllers: [AuthGatewayController, FoodGatewayController, HealthController],
  providers: [JwtStrategy, PrismaService, RabbitMQService],
})
export class AppModule {}
