export interface ChainConfig {
  id: number
  name: string
  rpcUrl: string
  contractAddress: string
  explorerUrl: string
}

export const getBlockchainConfig = (): ChainConfig[] => [
  {
    id: 56, // BNB Chain
    name: 'BNB Smart Chain',
    rpcUrl: process.env.BNB_RPC_URL || 'https://bsc-dataseed.binance.org/',
    contractAddress: process.env.BNB_CONTRACT_ADDRESS || '0x...',
    explorerUrl: 'https://bscscan.com'
  },
  {
    id: 97, // BNB Testnet
    name: 'BNB Testnet',
    rpcUrl: process.env.BNB_TESTNET_RPC || 'https://data-seed-prebsc-1-s1.binance.org:8545/',
    contractAddress: process.env.BNB_TESTNET_CONTRACT_ADDRESS || '0x...',
    explorerUrl: 'https://testnet.bscscan.com'
  }
]

import { registerAs } from '@nestjs/config';

interface ChainConfig {
  id: number;
  name: string;
  rpcUrl: string;
  contractAddress: string;
  explorerUrl: string;
  blockTime?: number;
}

export default registerAs('blockchain', () => ({
  chains: [
    {
      id: parseInt(process.env.BNB_CHAIN_ID || '56'),
      name: 'BNB Smart Chain',
      rpcUrl: process.env.BNB_RPC_URL || 'https://bsc-dataseed.binance.org/',
      contractAddress: process.env.BNB_CONTRACT_ADDRESS,
      explorerUrl: 'https://bscscan.com',
      blockTime: 3000,
    },
    {
      id: parseInt(process.env.BASE_CHAIN_ID || '8453'),
      name: 'Base Chain',
      rpcUrl: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
      contractAddress: process.env.BASE_CONTRACT_ADDRESS,
      explorerUrl: 'https://basescan.org',
      blockTime: 2000,
    },
  ] as ChainConfig[],
  defaultChain: parseInt(process.env.DEFAULT_CHAIN_ID || '56'),
}));