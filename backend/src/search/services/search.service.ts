import { Injectable } from '@nestjs/common'
import { ElasticsearchService } from '@nestjs/elasticsearch'
import { Information } from './information.model'

@Injectable()
export class SearchService {
  private readonly index = 'informations'

  constructor(private readonly es: ElasticsearchService) {}

  async indexInformation(info: Information) {
    return this.es.index<Information>({
      index: this.index,
      id: `${info.chainId}-${info.id}`,
      body: {
        title: info.title,
        content: info.content,
        author: info.author,
        tags: info.tags,
        timestamp: info.timestamp
      }
    })
  }

  async search(query: string, tags?: string[], chainId?: number) {
    const must: any[] = [
      {
        multi_match: {
          query,
          fields: ['title^3', 'content', 'tags^2']
        }
      }
    ]

    if (tags?.length) {
      must.push({ terms: { tags } })
    }

    if (chainId) {
      must.push({
        term: { 'chainId.keyword': chainId }
      })
    }

    const { body } = await this.es.search<Information>({
      index: this.index,
      body: {
        query: { bool: { must } },
        highlight: {
          fields: {
            content: {},
            title: {}
          }
        }
      }
    })

    return body.hits.hits.map(hit => ({
      ...hit._source,
      id: hit._id,
      highlight: hit.highlight
    }))
  }
}

import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { SearchRepository } from './search.repository';

@Injectable()
export class SearchService {
  constructor(
    private readonly es: ElasticsearchService,
    private readonly repository: SearchRepository,
  ) {}

  async search(query: string, filters?: any) {
    // 1. 记录搜索日志
    await this.repository.logSearch(query, filters);
    
    // 2. 执行Elasticsearch查询
    const { body } = await this.es.search({
      index: 'informations',
      body: {
        query: {
          bool: {
            must: [
              { match: { content: query }},
              ...this.buildFilters(filters)
            ]
          }
        },
        highlight: {
          fields: { content: {} }
        }
      }
    });

    // 3. 返回标准化结果
    return this.normalizeResults(body.hits.hits);
  }

  private buildFilters(filters: any) {
    // 过滤条件构建逻辑
  }

  private normalizeResults(raw: any[]) {
    // 结果标准化逻辑
  }
}