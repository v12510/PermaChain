import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockchainService } from './services/blockchain.service';
import { BlockchainController } from './controllers/blockchain.controller';
import { BlockchainListener } from './listeners/blockchain.listener';
import { ChainConfig } from './entities/chain-config.entity';
import { ContractEvent } from './entities/contract-event.entity';
import { getBlockchainConfig } from '../config/blockchain.config';
import { BlockchainHealthIndicator } from './health/blockchain.health';
import { BlockchainScheduler } from './schedulers/blockchain.scheduler';
import { InformationStorage__factory } from '../abis/types';

@Module({
  imports: [
    ConfigModule.forFeature(getBlockchainConfig),
    TypeOrmModule.forFeature([ChainConfig, ContractEvent]),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 5000,
        maxRedirects: 3,
      }),
    }),
  ],
  controllers: [BlockchainController],
  providers: [
    {
      provide: 'BLOCKCHAIN_CONFIG',
      useFactory: (config: ConfigService) => ({
        chains: config.get('blockchain.chains'),
        defaultChain: config.get('blockchain.defaultChain'),
      }),
      inject: [ConfigService],
    },
    {
      provide: 'CONTRACT_FACTORY',
      useValue: InformationStorage__factory,
    },
    BlockchainService,
    BlockchainListener,
    BlockchainHealthIndicator,
    BlockchainScheduler,
  ],
  exports: [BlockchainService, BlockchainHealthIndicator],
})
export class BlockchainModule {
  static forTest(testConfig: any) {
    return {
      module: BlockchainModule,
      providers: [
        {
          provide: 'BLOCKCHAIN_CONFIG',
          useValue: testConfig,
        },
        BlockchainService,
      ],
    };
  }
}