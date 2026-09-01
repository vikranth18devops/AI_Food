import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as amqp from 'amqplib';
import { loadAppConfig } from '@foodlens/shared-config';
import { StructuredLogger } from '@foodlens/shared-utils';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private logger = new StructuredLogger('food-service:rabbitmq');
  private config = loadAppConfig();
  private connection: any = null;
  private channel: any = null;
  private pendingHandler: ((msg: any) => Promise<void>) | null = null;

  public readonly exchangeName = 'foodlens.events';
  public readonly dlxExchangeName = 'foodlens.dlx';
  public readonly queueName = 'food_recognition_queue';

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

        await this.channel.assertExchange(this.exchangeName, 'topic', { durable: true });
        await this.channel.assertExchange(this.dlxExchangeName, 'topic', { durable: true });

        const dlqName = `${this.queueName}.dlq`;
        await this.channel.assertQueue(dlqName, { durable: true });
        await this.channel.bindQueue(dlqName, this.dlxExchangeName, 'FOOD_ANALYSIS_REQUESTED');

        await this.channel.assertQueue(this.queueName, {
          durable: true,
          arguments: {
            'x-dead-letter-exchange': this.dlxExchangeName,
            'x-dead-letter-routing-key': 'FOOD_ANALYSIS_REQUESTED',
          },
        });
        await this.channel.bindQueue(this.queueName, this.exchangeName, 'FOOD_ANALYSIS_REQUESTED');

        this.logger.info(`Queue [${this.queueName}] bound successfully`);

        if (this.pendingHandler) {
          await this.startConsumer(this.pendingHandler);
        }
        return;
      } catch (err: any) {
        this.logger.warn(`RabbitMQ connection attempt ${i + 1}/${retries} failed: ${err.message}`);
        if (i < retries - 1) {
          await new Promise(res => setTimeout(res, delayMs));
        }
      }
    }
  }

  async consume(handler: (msg: any) => Promise<void>) {
    this.pendingHandler = handler;
    if (this.channel) {
      await this.startConsumer(handler);
    }
  }

  private async startConsumer(handler: (msg: any) => Promise<void>) {
    if (!this.channel) return;
    await this.channel.consume(
      this.queueName,
      async (msg: any) => {
        if (!msg) return;
        try {
          await handler(msg);
          this.channel?.ack(msg);
        } catch (err: any) {
          this.logger.error('Error processing message in food service consumer', err);
          this.channel?.nack(msg, false, false);
        }
      },
      { noAck: false }
    );
  }

  async publishEvent(routingKey: string, payload: any) {
    if (!this.channel) return false;
    const buffer = Buffer.from(JSON.stringify(payload));
    return this.channel.publish(this.exchangeName, routingKey, buffer, {
      persistent: true,
      headers: { correlationId: payload.correlationId },
    });
  }
}
