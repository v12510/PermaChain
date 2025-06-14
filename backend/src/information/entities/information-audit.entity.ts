import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class InformationAudit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  informationId: string;

  @Column()
  action: 'CREATE' | 'UPDATE' | 'VIEW';

  @Column({ nullable: true })
  changedField?: string;

  @Column({ type: 'jsonb', nullable: true })
  oldValue?: any;

  @Column({ type: 'jsonb', nullable: true })
  newValue?: any;

  @Column()
  performedBy: string; // 用户ID或地址

  @CreateDateColumn()
  createdAt: Date;
}