import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as amqp from 'amqplib';
import { loadAppConfig } from '@foodlens/shared-config';
import { StructuredLogger } from '@foodlens/shared-utils';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private logger = new StructuredLogger('api-gateway:rabbitmq');
  private config = loadAppConfig();
  private connection: any = null;
  private channel: any = null;
  public readonly exchangeName = 'foodlens.events';
  public readonly dlxExchangeName = 'foodlens.dlx';

  async onModuleInit() {
    await this.connectWithRetry();
  }

  async onModuleDestroy() {
    if (this.channel) await this.channel.close();
    if (this.connection) await this.connection.close();
  }

  private async connectWithRetry(retries = 5, delayMs = 3000) {
    for (let i = 0; i < retries; i++) {
      try {
        this.logger.info(`Connecting to RabbitMQ at ${this.config.rabbitmqUrl}...`);
        this.connection = await amqp.connect(this.config.rabbitmqUrl);
        this.channel = await this.connection.createChannel();

        // Declare main exchange & DLX exchange
        await this.channel.assertExchange(this.exchangeName, 'topic', { durable: true });
        await this.channel.assertExchange(this.dlxExchangeName, 'topic', { durable: true });

        this.logger.info('Successfully connected to RabbitMQ and declared exchanges.');
        return;
      } catch (err: any) {
        this.logger.warn(`RabbitMQ connection attempt ${i + 1}/${retries} failed: ${err.message}`);
        if (i < retries - 1) {
          await new Promise(res => setTimeout(res, delayMs));
        } else {
          this.logger.error('Could not connect to RabbitMQ. Microservices will operate in fallback mode.', err);
        }
      }
    }
  }

  async publishEvent(routingKey: string, payload: any) {
    if (!this.channel) {
      this.logger.warn(`RabbitMQ channel not ready. Falling back for routingKey: ${routingKey}`);
      return false;
    }
    try {
      const buffer = Buffer.from(JSON.stringify(payload));
      this.channel.publish(this.exchangeName, routingKey, buffer, {
        persistent: true,
        headers: {
          correlationId: payload.correlationId,
        },
      });
      this.logger.info(`Published event [${routingKey}]`, { correlationId: payload.correlationId });
      return true;
    } catch (err: any) {
      this.logger.error(`Failed to publish event [${routingKey}]`, err);
      return false;
    }
  }
}
