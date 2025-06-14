import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ethers } from 'ethers';
import { InformationStorage__factory } from '../../abis/types';
import { ConfigService } from '@nestjs/config';
import { ChainId } from '../enums/chain-id.enum';
import { RetryPolicy } from '../utils/retry-policy.util';

@Injectable()
export class BaseListener implements OnModuleInit {
  private readonly logger = new Logger(BaseListener.name);
  private provider: ethers.providers.JsonRpcProvider;
  private contract: ethers.Contract;
  private retryPolicy = new RetryPolicy({
    maxRetries: 5,
    baseDelay: 1000,
  });

  constructor(
    private readonly config: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async onModuleInit() {
    await this.initialize();
  }

  private async initialize() {
    try {
      // 1. 获取Base链配置
      const config = {
        rpcUrl: this.config.get<string>('BASE_RPC_URL'),
        contractAddress: this.config.get<string>('BASE_CONTRACT_ADDRESS'),
        confirmations: this.config.get<number>('BASE_CONFIRMATIONS', 3),
      };

      // 2. 初始化提供者（带重试机制）
      this.provider = await this.retryPolicy.execute(() => 
        new ethers.providers.JsonRpcProvider(config.rpcUrl)
      );

      // 3. 初始化合约实例
      this.contract = InformationStorage__factory.connect(
        config.contractAddress,
        this.provider
      );

      // 4. 启动事件监听
      this.setupEventListeners();

      this.logger.log(`Base Listener initialized on contract ${config.contractAddress}`);
    } catch (error) {
      this.logger.error(`Base Listener initialization failed: ${error.message}`);
      throw error;
    }
  }

  private setupEventListeners() {
    // 监听InformationSubmitted事件（带确认块机制）
    this.contract.on(
      'InformationSubmitted',
      async (id: ethers.BigNumber, author: string, event: ethers.Event) => {
        try {
          const receipt = await event.getTransactionReceipt();
          if (receipt.confirmations < this.config.get('BASE_CONFIRMATIONS', 3)) {
            this.logger.debug(`Waiting for confirmations: ${receipt.confirmations}`);
            return;
          }

          await this.handleInformationSubmitted(
            id.toNumber(),
            author,
            event.transactionHash,
            event.blockNumber
          );
        } catch (error) {
          this.logger.error(`Error processing Base event: ${error.message}`);
        }
      }
    );

    // 网络事件处理
    this.provider.on('block', (blockNumber) => {
      this.eventEmitter.emit('base.newBlock', blockNumber);
    });

    this.provider.on('error', (error) => {
      this.eventEmitter.emit('chain.error', {
        chainId: ChainId.BASE,
        error: error.message
      });
    });
  }

  private async handleInformationSubmitted(
    id: number,
    author: string,
    txHash: string,
    blockNumber: number
  ) {
    try {
      // 1. 获取完整信息（带重试）
      const info = await this.retryPolicy.execute(() =>
        this.contract.getInformation(id)
      );

      // 2. 触发处理流水线
      this.eventEmitter.emit('information.submitted', {
        chainId: ChainId.BASE,
        id,
        author,
        txHash,
        blockNumber,
        title: info.title,
        contentHash: info.contentHash,
        tags: info.tags,
        timestamp: new Date().toISOString(),
      });

      this.logger.log(`New Base info: #${id} in block ${blockNumber}`);
    } catch (error) {
      this.logger.error(`Failed to process Base info ${id}: ${error.message}`);
      this.eventEmitter.emit('information.failed', {
        chainId: ChainId.BASE,
        id,
        error: error.message
      });
    }
  }

  async shutdown() {
    try {
      this.contract.removeAllListeners();
      this.provider.removeAllListeners();
      this.logger.log('Base Listener stopped gracefully');
    } catch (error) {
      this.logger.error(`Error during shutdown: ${error.message}`);
    }
  }
}