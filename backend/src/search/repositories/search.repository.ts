import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SearchQuery } from './entities/search-query.entity';

@Injectable()
export class SearchRepository {
  constructor(
    @InjectRepository(SearchQuery)
    private readonly queryRepo: Repository<SearchQuery>,
  ) {}

  async logSearch(query: string, meta: any) {
    const existing = await this.queryRepo.findOne({ 
      where: { keyword: query } 
    });

    if (existing) {
      await this.queryRepo.update(existing.id, {
        searchCount: existing.searchCount + 1,
        lastSearchedAt: new Date(),
      });
    } else {
      await this.queryRepo.save({
        keyword: query,
        tags: meta?.tags || [],
        chainId: meta?.chainId,
        searchCount: 1,
      });
    }
  }
}