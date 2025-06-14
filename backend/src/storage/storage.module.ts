import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StorageService } from './storage.service';
import { IpfsService } from './services/ipfs.service';
import { GcsService } from './services/gcs.service';

@Module({})
export class StorageModule {
  static forRoot(): DynamicModule {
    return {
      module: StorageModule,
      imports: [ConfigModule],
      providers: [
        {
          provide: 'STORAGE_STRATEGY',
          useFactory: (config: ConfigService) => {
            return config.get('STORAGE_TYPE') === 'ipfs'
              ? new IpfsService(config)
              : new GcsService(config);
          },
          inject: [ConfigService],
        },
        StorageService,
      ],
      exports: [StorageService],
    };
  }
}

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StorageProvider } from './storage.provider';
import { IpfsService } from './services/ipfs.service';
import { GcsService } from './services/gcs.service';
import storageConfig from './config/storage.config';

@Module({
  imports: [
    ConfigModule.forFeature(storageConfig),
  ],
  providers: [
    IpfsService,
    GcsService,
    StorageProvider, // 注册主提供者
    {
      provide: 'IPFS_CONFIG',
      useFactory: (config: ConfigService) => config.get('storage.config.ipfs'),
      inject: [ConfigService],
    },
    {
      provide: 'GCS_CONFIG',
      useFactory: (config: ConfigService) => config.get('storage.config.gcs'),
      inject: [ConfigService],
    },
  ],
  exports: ['STORAGE_SERVICE'], // 暴露存储服务接口
})
export class StorageModule {}