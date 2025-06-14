import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Information } from './entities/information.entity';
import { InformationService } from './information.service';
import { InformationController } from './information.controller';
import { InformationRepository } from './repositories/information.repository';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Information]),
    BlockchainModule,
    StorageModule,
  ],
  controllers: [InformationController],
  providers: [InformationService, InformationRepository],
  exports: [InformationService],
})
export class InformationModule {}