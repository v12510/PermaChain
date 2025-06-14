import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity()
export class SearchQuery {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  keyword: string;

  @Column('simple-array')
  tags: string[];

  @Column({ nullable: true })
  chainId?: number;

  @Column({ default: 1 })
  searchCount: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastSearchedAt: Date;
}