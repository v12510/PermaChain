import { ethers } from 'ethers'

export interface BlockchainInfo {
  title: string
  contentHash: string
  author: string
  tags: string[]
  attachmentHash: string
  attachmentType: string
  timestamp: number
  googleCloudURL: string
}

export interface SubmitOptions {
  gasLimit?: ethers.BigNumberish
  value?: ethers.BigNumberish
  waitForConfirmations?: number
}

export interface BlockchainEventCallbacks {
  onTransactionHash?: (hash: string) => void
  onReceipt?: (receipt: ethers.providers.TransactionReceipt) => void
  onError?: (error: Error) => void
}