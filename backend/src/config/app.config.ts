import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  env: process.env.NODE_ENV || 'development',
  name: 'Blockchain Information Service',
  port: parseInt(process.env.PORT, 10) || 3000,
  apiPrefix: 'api',
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL) || 60,
    limit: parseInt(process.env.THROTTLE_LIMIT) || 100,
  },
  blockchain: {
    chains: [
      {
        id: parseInt(process.env.BNB_CHAIN_ID),
        name: 'BNB Smart Chain',
        rpcUrl: process.env.BNB_RPC_URL,
        contractAddress: process.env.BNB_CONTRACT_ADDRESS,
      },
      // 其他链配置...
    ],
  },
}));