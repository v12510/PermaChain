import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { SearchRepository } from './search.repository';
import { SearchQuery } from './entities/search-query.entity';
import { SearchResult } from './entities/search-result.entity';

@Module({
  imports: [
    // Elasticsearch动态配置
    ElasticsearchModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        node: config.get('ELASTICSEARCH_NODE'),
        auth: {
          username: config.get('ELASTICSEARCH_USERNAME'),
          password: config.get('ELASTICSEARCH_PASSWORD'),
        },
        maxRetries: 5,
        requestTimeout: 60000,
        pingTimeout: 3000,
      }),
      inject: [ConfigService],
    }),

    // 数据库实体注册
    TypeOrmModule.forFeature([SearchQuery, SearchResult]),
  ],
  controllers: [SearchController],
  providers: [SearchService, SearchRepository],
  exports: [SearchService], // 导出供其他模块使用
})
export class SearchModule {}