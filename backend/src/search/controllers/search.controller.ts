import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchQueryDto } from './dtos/search-query.dto';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: '全文搜索' })
  async search(@Query() dto: SearchQueryDto) {
    return this.searchService.search(dto.query, {
      tags: dto.tags,
      chainId: dto.chainId,
    });
  }
}