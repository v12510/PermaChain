import { Injectable, OnModuleInit } from '@nestjs/common'
import { ethers } from 'ethers'
import { InformationStorage__factory } from '../abis/types'
import { ConfigService } from '@nestjs/config'
import { ChainConfig } from '../config/blockchain.config'

@Injectable()
export class BlockchainService implements OnModuleInit {
  private providers: Map<number, ethers.providers.JsonRpcProvider> = new Map()
  private contracts: Map<number, ethers.Contract> = new Map()

  constructor(private config: ConfigService) {}

  async onModuleInit() {
    this.initializeProviders()
  }

  private initializeProviders() {
    const chains = this.config.get<ChainConfig[]>('blockchain.chains')
    chains.forEach(chain => {
      const provider = new ethers.providers.JsonRpcProvider(chain.rpcUrl)
      this.providers.set(chain.id, provider)
      
      const contract = InformationStorage__factory.connect(
        chain.contractAddress,
        provider
      )
      this.contracts.set(chain.id, contract)
    })
  }

  async getInformation(chainId: number, id: number) {
    const contract = this.getContract(chainId)
    const info = await contract.getInformation(id)
    return {
      id,
      chainId,
      title: info.title,
      contentHash: info.contentHash,
      author: info.author,
      tags: info.tags,
      timestamp: info.timestamp.toNumber()
    }
  }

  private getContract(chainId: number): ethers.Contract {
    const contract = this.contracts.get(chainId)
    if (!contract) throw new Error(`Unsupported chain: ${chainId}`)
    return contract
  }
}