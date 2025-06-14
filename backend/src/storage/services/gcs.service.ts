import { Injectable } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';
import { IStorageService, UploadResult, RetrieveResult } from '../interfaces/storage.interface';

@Injectable()
export class GcsService implements IStorageService {
  private storage: Storage;
  private bucket: string;

  constructor(private config: StorageServiceConfig['config']['gcs']) {
    this.storage = new Storage({
      projectId: config.projectId,
      keyFilename: config.keyFilename,
    });
    this.bucket = config.bucketName;
  }

  async upload(payload: StoragePayload, options?: UploadOptions): Promise<UploadResult> {
    const filename = options?.filename || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const file = this.storage.bucket(this.bucket).file(filename);

    let buffer: Buffer;
    if (payload instanceof Buffer) {
      buffer = payload;
    } else if (typeof payload === 'string') {
      buffer = Buffer.from(payload);
    } else {
      buffer = payload.buffer;
    }

    await file.save(buffer, {
      metadata: {
        contentType: options?.metadata?.['contentType'] || 'application/octet-stream',
        metadata: options?.metadata,
      },
    });

    return {
      ipfsHash: '', // GCS不返回IPFS哈希
      storageUrl: `https://storage.googleapis.com/${this.bucket}/${filename}`,
      fileType: options?.metadata?.['contentType'] || 'application/octet-stream',
      size: buffer.length,
      timestamp: new Date(),
    };
  }

  async retrieve(reference: string): Promise<RetrieveResult> {
    const file = this.storage.bucket(this.bucket).file(reference);
    const [buffer, metadata] = await Promise.all([
      file.download(),
      file.getMetadata(),
    ]);

    return {
      content: Buffer.concat(buffer),
      metadata: {
        contentType: metadata[0].contentType,
        originalName: metadata[0].name,
        uploadTime: new Date(metadata[0].timeCreated),
      },
    };
  }

  // 其他方法实现...
}