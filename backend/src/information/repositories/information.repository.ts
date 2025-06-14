import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { Information } from '../entities/information.entity';

@Injectable()
export class InformationRepository {
  constructor(
    @InjectRepository(Information)
    private readonly repo: Repository<Information>,
  ) {}

  async create(info: Partial<Information>) {
    const entity = this.repo.create(info);
    return this.repo.save(entity);
  }

  async findByChain(chainId: number, blockchainId: number) {
    return this.repo.findOne({ where: { chainId, blockchainId } });
  }

  async search(options: FindManyOptions<Information>) {
    return this.repo.findAndCount(options);
  }

  async update(id: string, updates: Partial<Information>) {
    await this.repo.update(id, { ...updates, lastUpdatedAt: new Date() });
    return this.repo.findOne({ where: { id } });
  }
}