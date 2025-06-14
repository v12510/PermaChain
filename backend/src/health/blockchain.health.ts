import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { BlockchainService } from '../services/blockchain.service';

@Injectable()
export class BlockchainHealthIndicator extends HealthIndicator {
  constructor(private blockchainService: BlockchainService) {
    super();
  }

  async checkChain(chainId: number): Promise<HealthIndicatorResult> {
    try {
      const blockNumber = await this.blockchainService
        .getProvider(chainId)
        .getBlockNumber();
      
      return this.getStatus(`chain_${chainId}`, true, {
        blockNumber,
      });
    } catch (error) {
      return this.getStatus(`chain_${chainId}`, false, {
        error: error.message,
      });
    }
  }
}