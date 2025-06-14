import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn } from 'typeorm';

@Entity()
export class Information {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  chainId: number; // 区块链网络ID

  @Column()
  @Index()
  blockchainId: number; // 区块链上的唯一ID

  @Column()
  title: string;

  @Column('text')
  content: string;

  @Column()
  contentHash: string; // IPFS内容哈希

  @Column()
  authorAddress: string; // 作者钱包地址

  @Column('simple-array')
  tags: string[];

  @Column({ nullable: true })
  attachmentHash?: string; // 附件IPFS哈希

  @Column({ nullable: true })
  attachmentType?: string; // 附件MIME类型

  @Column({ nullable: true })
  googleCloudUrl?: string; // 云存储URL

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastUpdatedAt?: Date;
}