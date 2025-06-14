import { Readable } from 'stream';

/**
 * 文件上传结果
 */
export interface UploadResult {
  /** IPFS内容标识符 */
  ipfsHash: string;
  
  /** 云存储URL */
  storageUrl: string;
  
  /** 文件类型 */
  fileType: string;
  
  /** 文件大小（字节） */
  size: number;
  
  /** 上传时间戳 */
  timestamp: Date;
}

/**
 * 内容检索结果
 */
export interface RetrieveResult {
  /** 文件内容（Buffer或字符串） */
  content: Buffer | string;
  
  /** 元数据 */
  metadata: {
    /** MIME类型 */
    contentType: string;
    
    /** 原始文件名（如果有） */
    originalName?: string;
    
    /** 上传时间 */
    uploadTime?: Date;
  };
}

/**
 * 存储服务抽象接口
 */
export interface IStorageService {
  /**
   * 上传文件内容
   * @param payload 文件内容
   * @param options 上传选项
   */
  upload(
    payload: StoragePayload,
    options?: UploadOptions
  ): Promise<UploadResult>;

  /**
   * 检索文件内容
   * @param reference 存储引用（IPFS哈希或URL）
   */
  retrieve(reference: string): Promise<RetrieveResult>;

  /**
   * 删除存储内容
   * @param reference 存储引用
   */
  delete(reference: string): Promise<void>;

  /**
   * 生成访问令牌（用于私有存储）
   * @param reference 存储引用
   * @param expiresIn 过期时间（秒）
   */
  generateAccessToken?(reference: string, expiresIn: number): Promise<string>;
}

/**
 * 上传内容载荷
 */
export type StoragePayload =
  | Buffer
  | Readable
  | string
  | {
      /** 原始文件名 */
      originalname: string;
      
      /** 文件Buffer */
      buffer: Buffer;
      
      /** MIME类型 */
      mimetype: string;
    };

/**
 * 上传选项
 */
export interface UploadOptions {
  /** 文件名称（用于生成最终URL） */
  filename?: string;
  
  /** 是否固定到IPFS节点 */
  pinToIpfs?: boolean;
  
  /** 存储级别（标准/低频访问/归档） */
  storageClass?: 'STANDARD' | 'NEARLINE' | 'COLDLINE' | 'ARCHIVE';
  
  /** 元数据标签 */
  metadata?: Record<string, string>;
  
  /** 是否私有存储（需要生成访问令牌） */
  isPrivate?: boolean;
}

/**
 * 存储服务类型
 */
export enum StorageServiceType {
  IPFS = 'ipfs',
  GOOGLE_CLOUD = 'gcs',
  AWS_S3 = 's3',
  HYBRID = 'hybrid',
}

/**
 * 存储服务配置
 */
export interface StorageServiceConfig {
  /** 服务类型 */
  type: StorageServiceType;
  
  /** 服务特定配置 */
  config: {
    /** IPFS配置 */
    ipfs?: {
      host: string;
      port: number;
      protocol: 'http' | 'https';
      headers?: Record<string, string>;
    };
    
    /** Google云存储配置 */
    gcs?: {
      projectId: string;
      bucketName: string;
      keyFilename?: string;
    };
    
    /** AWS S3配置 */
    s3?: {
      region: string;
      bucket: string;
      accessKeyId: string;
      secretAccessKey: string;
    };
  };
  
  /** 默认上传选项 */
  defaultUploadOptions?: UploadOptions;
}

/**
 * 存储服务健康状态
 */
export interface StorageHealth {
  service: StorageServiceType;
  status: 'UP' | 'DOWN';
  details?: {
    /** 存储空间使用情况 */
    storageUsed?: string;
    
    /** 最近错误（如果有） */
    lastError?: string;
    
    /** 节点信息（IPFS专用） */
    nodeInfo?: Record<string, any>;
  };
}