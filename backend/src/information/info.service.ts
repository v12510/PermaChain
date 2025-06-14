import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { BlockchainEvent } from '../blockchain/blockchain.types';

@Injectable()
export class InformationEvents {
  @OnEvent('blockchain.info.submitted')
  async handleNewInformation(event: BlockchainEvent) {
    // 处理区块链事件
  }
}