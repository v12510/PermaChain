import { registerAs } from '@nestjs/config';

export default registerAs('storage', () => ({
  type: process.env.STORAGE_TYPE || 'hybrid',
  config: {
    ipfs: {
      host: process.env.IPFS_HOST || 'ipfs.infura.io',
      port: parseInt(process.env.IPFS_PORT) || 5001,
      protocol: process.env.IPFS_PROTOCOL || 'https',
      headers: {
        authorization: `Basic ${Buffer.from(
          `${process.env.IPFS_API_KEY}:${process.env.IPFS_API_SECRET}`
        ).toString('base64')}`
      }
    },
    gcs: {
      projectId: process.env.GCP_PROJECT_ID,
      bucketName: process.env.GCP_BUCKET_NAME,
      keyFilename: process.env.GCP_KEY_FILE_PATH
    },
    hybrid: {
      primary: process.env.STORAGE_PRIMARY || 'ipfs',
      fallback: process.env.STORAGE_FALLBACK || 'gcs',
      failoverThreshold: parseInt(process.env.STORAGE_FAILOVER_THRESHOLD) || 3
    }
  },
  defaultUploadOptions: {
    pinToIpfs: true,
    storageClass: 'STANDARD',
    isPrivate: process.env.NODE_ENV === 'production'
  }
}));