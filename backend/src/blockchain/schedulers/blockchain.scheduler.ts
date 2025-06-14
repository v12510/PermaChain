import { Injectable, Logger } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { BlockchainService } from '../services/blockchain.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class BlockchainScheduler {
  private readonly logger = new Logger(BlockchainScheduler.name);

  constructor(
    private schedulerRegistry: SchedulerRegistry,
    private blockchainService: BlockchainService,
    private eventEmitter: EventEmitter2,
  ) {}

  startPolling(chainId: number, interval: number) {
    const callback = async () => {
      try {
        const latestBlock = await this.blockchainService
          .getProvider(chainId)
          .getBlockNumber();
        
        this.eventEmitter.emit('block.new', { chainId, blockNumber: latestBlock });
      } catch (error) {
        this.logger.error(`Polling chain ${chainId} failed: ${error.message}`);
      }
    };

    const intervalInstance = setInterval(callback, interval);
    this.schedulerRegistry.addInterval(`chain_${chainId}_poll`, intervalInstance);
  }
}