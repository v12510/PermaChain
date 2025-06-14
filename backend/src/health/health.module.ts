import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { DatabaseHealthIndicator } from './indicators/database.health';
import { BlockchainHealthIndicator } from './indicators/blockchain.health';
import { StorageHealthIndicator } from './indicators/storage.health';
import { QueueHealthIndicator } from './indicators/queue.health';

@Module({
  imports: [TerminusModule, TypeOrmModule.forFeature([])],
  controllers: [HealthController],
  providers: [
    HealthService,
    DatabaseHealthIndicator,
    BlockchainHealthIndicator,
    StorageHealthIndicator,
    QueueHealthIndicator,
  ],
})
export class HealthModule {
  constructor(
    private health: HealthService,
    private database: DatabaseHealthIndicator,
    private blockchain: BlockchainHealthIndicator,
    private storage: StorageHealthIndicator,
    private queue: QueueHealthIndicator,
  ) {
    // 注册所有健康指标
    this.health.registerIndicator(database);
    this.health.registerIndicator(blockchain);
    this.health.registerIndicator(storage);
    this.health.registerIndicator(queue);
  }
}