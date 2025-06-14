import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ethers } from 'ethers';
import { InformationStorage__factory } from '../../abis/types';
import { ConfigService } from '@nestjs/config';
import { BlockchainService } from '../services/blockchain.service';
import { ChainId } from '../enums/chain-id.enum';

@Injectable()
export class BnbListener {
  private readonly logger = new Logger(BnbListener.name);
  private provider: ethers.providers.JsonRpcProvider;
  private contract: ethers.Contract;

  constructor(
    private config: ConfigService,
    private blockchainService: BlockchainService,
    private eventEmitter: EventEmitter2
  ) {
    this.init();
  }

  private async init() {
    try {
      // 1. 获取配置
      const rpcUrl = this.config.get<string>('BNB_RPC_URL');
      const contractAddress = this.config.get<string>('BNB_CONTRACT_ADDRESS');

      // 2. 初始化提供者和合约
      this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
      this.contract = InformationStorage__factory.connect(
        contractAddress,
        this.provider
      );

      // 3. 启动监听
      this.listenToEvents();
      
      this.logger.log('BNB Chain listener initialized');
    } catch (error) {
      this.logger.error(`BNB Listener init failed: ${error.message}`);
    }
  }

  private listenToEvents() {
    // 监听信息提交事件
    this.contract.on(
      'InformationSubmitted',
      (id: ethers.BigNumber, author: string, event: ethers.Event) => {
        this.handleInformationSubmitted(
          id.toNumber(),
          author,
          event.transactionHash
        );
      }
    );

    // 错误处理
    this.provider.on('error', (error) => {
      this.eventEmitter.emit('chain.error', {
        chainId: ChainId.BNB,
        error: error.message
      });
    });
  }

  private async handleInformationSubmitted(
    id: number,
    author: string,
    txHash: string
  ) {
    try {
      // 1. 获取完整信息
      const info = await this.blockchainService.getInformation(ChainId.BNB, id);
      
      // 2. 触发事件处理流水线
      this.eventEmitter.emit('information.submitted', {
        chainId: ChainId.BNB,
        id,
        author,
        txHash,
        title: info.title,
        contentHash: info.contentHash,
        timestamp: Date.now()
      });

      this.logger.log(`New info on BNB Chain: ${id} by ${author}`);
    } catch (error) {
      this.logger.error(
        `Failed to process BNB info ${id}: ${error.message}`
      );
    }
  }

  async stopListening() {
    this.contract.removeAllListeners();
    this.provider.removeAllListeners();
  }
}