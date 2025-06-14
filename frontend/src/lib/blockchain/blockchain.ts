import { ethers } from 'ethers'
import { InformationStorage__factory } from '@/abis/types'
import { ChainConfig, getChainConfig } from './config'

/**
 * 区块链服务单例
 */
class BlockchainService {
  private static instance: BlockchainService
  private providers: Map<number, ethers.providers.JsonRpcProvider> = new Map()
  private contracts: Map<number, ethers.Contract> = new Map()

  private constructor() {
    this.initializeProviders()
  }

  public static getInstance(): BlockchainService {
    if (!BlockchainService.instance) {
      BlockchainService.instance = new BlockchainService()
    }
    return BlockchainService.instance
  }

  /**
   * 初始化多链Provider
   */
  private initializeProviders() {
    const chains = getChainConfig().supportedChains
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

  /**
   * 获取指定链的Provider
   */
  public getProvider(chainId: number): ethers.providers.JsonRpcProvider {
    const provider = this.providers.get(chainId)
    if (!provider) {
      throw new Error(`Provider for chain ${chainId} not initialized`)
    }
    return provider
  }

  /**
   * 获取合约实例
   */
  public getContract(chainId: number): ethers.Contract {
    const contract = this.contracts.get(chainId)
    if (!contract) {
      throw new Error(`Contract for chain ${chainId} not initialized`)
    }
    return contract
  }

  /**
   * 提交信息到区块链
   */
  public async submitInformation(
    chainId: number,
    signer: ethers.Signer,
    data: {
      title: string
      contentHash: string
      tags: string[]
      attachmentHash?: string
      attachmentType?: string
      googleCloudURL?: string
    },
    options?: {
      gasLimit?: ethers.BigNumberish
      value?: ethers.BigNumberish
    }
  ): Promise<ethers.providers.TransactionResponse> {
    const contract = InformationStorage__factory.connect(
      getChainConfig(chainId).contractAddress,
      signer
    )

    return contract.submitInformation(
      data.title,
      data.contentHash,
      data.tags,
      data.attachmentHash || '',
      data.attachmentType || '',
      data.googleCloudURL || '',
      {
        gasLimit: options?.gasLimit || 500000,
        value: options?.value || 0
      }
    )
  }

  /**
   * 获取信息详情
   */
  public async getInformation(
    chainId: number,
    id: number
  ): Promise<{
    title: string
    contentHash: string
    author: string
    tags: string[]
    attachmentHash: string
    attachmentType: string
    timestamp: number
    googleCloudURL: string
  }> {
    const contract = this.getContract(chainId)
    const info = await contract.getInformation(id)

    return {
      title: info.title,
      contentHash: info.contentHash,
      author: info.author,
      tags: info.tags,
      attachmentHash: info.attachmentHash,
      attachmentType: info.attachmentType,
      timestamp: info.timestamp.toNumber(),
      googleCloudURL: info.googleCloudURL
    }
  }

  /**
   * 通过标签搜索信息
   */
  public async searchByTag(
    chainId: number,
    tag: string,
    limit = 10
  ): Promise<number[]> {
    const contract = this.getContract(chainId)
    const ids = await contract.getIdsByTag(tag)
    return ids.slice(0, limit).map(id => id.toNumber())
  }

  /**
   * 监听信息提交事件
   */
  public onInformationSubmitted(
    chainId: number,
    callback: (id: number, author: string) => void
  ): () => void {
    const contract = this.getContract(chainId)
    const filter = contract.filters.InformationSubmitted()
    
    const listener = (id: ethers.BigNumber, author: string) => {
      callback(id.toNumber(), author)
    }

    contract.on(filter, listener)

    // 返回取消监听函数
    return () => {
      contract.off(filter, listener)
    }
  }

  /**
   * 估算提交交易的Gas费用
   */
  public async estimateSubmitGas(
    chainId: number,
    data: {
      title: string
      contentHash: string
      tags: string[]
    }
  ): Promise<ethers.BigNumber> {
    const contract = this.getContract(chainId)
    return contract.estimateGas.submitInformation(
      data.title,
      data.contentHash,
      data.tags,
      '', '', ''
    )
  }
}

// 导出单例实例
export const blockchainService = BlockchainService.getInstance()