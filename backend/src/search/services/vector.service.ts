import { Injectable, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { IVectorStrategy } from '../interfaces/vector-strategy.interface';
import { VECTOR_STRATEGY } from '../constants';
import { SearchQueryDto } from '../dtos/search-query.dto';
import { sleep } from '../../common/utils';

@Injectable()
export class VectorService {
  private readonly logger = new Logger(VectorService.name);
  private readonly indexName: string;
  private readonly maxDimensions: number;

  constructor(
    private readonly es: ElasticsearchService,
    private readonly config: ConfigService,
    @Inject(VECTOR_STRATEGY)
    private readonly strategy: IVectorStrategy,
  ) {
    this.indexName = this.config.get('ELASTICSEARCH_VECTOR_INDEX') || 'content-vectors';
    this.maxDimensions = this.config.get('VECTOR_MAX_DIMENSIONS') || 768;
  }

  /**
   * 执行向量相似度搜索
   */
  async vectorSearch(dto: SearchQueryDto, options?: {
    k?: number;               // 返回结果数量
    minScore?: number;        // 最小相似度分数
    filter?: any;             // 附加过滤条件
  }) {
    // 1. 生成查询向量
    const vector = await this.generateEmbedding(dto.query);

    // 2. 构建ES向量查询
    const query = {
      script_score: {
        query: this.buildBaseQuery(dto),
        script: {
          source: "cosineSimilarity(params.query_vector, 'vector') + 1.0",
          params: { query_vector: vector },
        },
      },
    };

    // 3. 执行搜索
    try {
      const { body } = await this.es.search({
        index: this.indexName,
        body: {
          size: options?.k || 10,
          query,
          _source: ['id', 'content', 'metadata'],
        },
      });

      // 4. 过滤和格式化结果
      return this.processResults(body.hits.hits, options?.minScore);
    } catch (error) {
      this.logger.error(`Vector search failed: ${error.message}`);
      throw new Error('Vector search unavailable');
    }
  }

  /**
   * 为内容生成向量并索引
   */
  async indexContent(content: {
    id: string;
    text: string;
    metadata: Record<string, any>;
  }) {
    try {
      // 1. 生成向量
      const vector = await this.generateEmbedding(content.text);

      // 2. 索引到Elasticsearch
      await this.es.index({
        index: this.indexName,
        id: content.id,
        body: {
          content: content.text,
          vector,
          metadata: content.metadata,
          timestamp: new Date().toISOString(),
        },
      });

      this.logger.log(`Indexed vector for content ${content.id}`);
    } catch (error) {
      this.logger.error(`Indexing failed for ${content.id}: ${error.message}`);
      throw error;
    }
  }

  /**
   * 生成文本嵌入向量
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    // 重试机制（3次尝试）
    let attempts = 0;
    let lastError: Error;

    while (attempts < 3) {
      try {
        return await this.strategy.generateEmbedding(text);
      } catch (error) {
        lastError = error;
        attempts++;
        await sleep(500 * attempts);
      }
    }

    this.logger.error(`Embedding generation failed after 3 attempts: ${lastError.message}`);
    throw lastError;
  }

  /**
   * 构建基础查询（结合关键词和过滤器）
   */
  private buildBaseQuery(dto: SearchQueryDto) {
    const must: any[] = [];

    if (dto.tags?.length) {
      must.push({ terms: { 'metadata.tags': dto.tags } });
    }

    if (dto.chainId) {
      must.push({ term: { 'metadata.chainId': dto.chainId } });
    }

    return must.length > 0 ? { bool: { must } } : { match_all: {} };
  }

  /**
   * 处理原始搜索结果
   */
  private processResults(hits: any[], minScore = 0.5) {
    return hits
      .filter(hit => hit._score >= minScore)
      .map(hit => ({
        id: hit._id,
        score: hit._score,
        content: hit._source.content,
        metadata: hit._source.metadata,
        highlight: hit.highlight,
      }));
  }
}