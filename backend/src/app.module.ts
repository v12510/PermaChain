import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerModule } from '@nestjs/throttler';
import { BlockchainModule } from './blockchain/blockchain.module';
import { StorageModule } from './storage/storage.module';
import { SearchModule } from './search/search.module';
import { InformationModule } from './information/information.module';
import { HealthModule } from './health/health.module';
import configuration from './config/app.config';
import { validate } from './config/env.validation';
import { LoggerModule } from './common/logger/logger.module';
import { BlockchainListener } from './blockchain/listeners/blockchain.listener';

@Module({
  imports: [
    // 配置模块（加载.env文件）
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate, // 环境变量验证
      cache: true,
    }),

    // 数据库模块
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: config.get('DB_PORT'),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: config.get('NODE_ENV') !== 'production',
        logging: config.get('DB_LOGGING'),
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
        migrationsRun: true,
      }),
      inject: [ConfigService],
    }),

    // 速率限制（防DDoS）
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        ttl: config.get('THROTTLE_TTL'),
        limit: config.get('THROTTLE_LIMIT'),
      }),
      inject: [ConfigService],
    }),

    // 任务调度
    ScheduleModule.forRoot(),

    // 事件总线
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
    }),

    // 自定义日志
    LoggerModule,

    // 应用模块
    BlockchainModule,
    StorageModule.forRoot(), // 动态配置存储策略
    SearchModule,
    InformationModule,
    HealthModule,
  ],
  providers: [BlockchainListener], // 全局事件监听
})
export class AppModule {}