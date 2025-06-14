import { Provider } from '@nestjs/common';
import { StorageService } from './storage.service';
import { IStorageService, StorageServiceConfig, StorageServiceType } from './interfaces/storage.interface';
import { IpfsService } from './services/ipfs.service';
import { GcsService } from './services/gcs.service';
import { HybridStorageService } from './services/hybrid.service';
import { ConfigService } from '@nestjs/config';

/**
 * 存储服务提供者工厂
 */
export const StorageProvider: Provider = {
  provide: 'STORAGE_SERVICE',
  useFactory: (
    configService: ConfigService,
    ipfsService: IpfsService,
    gcsService: GcsService,
  ) => {
    const storageConfig = configService.get<StorageServiceConfig>('storage');

    switch (storageConfig.type) {
      case StorageServiceType.IPFS:
        return ipfsService;
      
      case StorageServiceType.GOOGLE_CLOUD:
        return gcsService;
      
      case StorageServiceType.HYBRID:
        return new HybridStorageService(
          ipfsService,
          gcsService,
          storageConfig.config.hybrid || {
            primary: StorageServiceType.IPFS,
            fallback: StorageServiceType.GOOGLE_CLOUD
          }
        );
      
      default:
        throw new Error(`Unsupported storage type: ${storageConfig.type}`);
    }
  },
  inject: [ConfigService, IpfsService, GcsService],
};

/**
 * 混合存储服务实现
 */
class HybridStorageService implements IStorageService {
  constructor(
    private readonly primary: IStorageService,
    private readonly fallback: IStorageService,
    private readonly strategy: {
      primary: StorageServiceType;
      fallback: StorageServiceType;
      failoverThreshold?: number; // 错误次数阈值
    }
  ) {}

  private errorCount = 0;
  private readonly MAX_ERRORS = this.strategy.failoverThreshold || 3;

  async upload(payload: any, options?: any): Promise<any> {
    try {
      const result = await this.primary.upload(payload, options);
      this.errorCount = 0; // 重置错误计数
      return result;
    } catch (error) {
      this.errorCount++;
      
      if (this.errorCount >= this.MAX_ERRORS) {
        return this.fallback.upload(payload, options);
      }
      throw error;
    }
  }

  async retrieve(reference: string): Promise<any> {
    try {
      // 尝试从主存储检索
      return await this.primary.retrieve(reference);
    } catch (error) {
      // 主存储失败时尝试备用存储
      return this.fallback.retrieve(reference);
    }
  }

  async delete(reference: string): Promise<void> {
    // 双写双删
    await Promise.allSettled([
      this.primary.delete(reference),
      this.fallback.delete(reference)
    ]);
  }
}