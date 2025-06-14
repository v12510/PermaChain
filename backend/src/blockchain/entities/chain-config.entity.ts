import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity()
export class ChainConfig {
  @PrimaryColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  rpcUrl: string;

  @Column()
  contractAddress: string;

  @Column({ nullable: true })
  lastBlockNumber: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastUpdated: Date;
}