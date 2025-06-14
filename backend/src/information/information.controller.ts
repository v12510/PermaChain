import { Controller, Post, Body, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InformationService } from './information.service';
import { CreateInformationDto } from './dtos/create-information.dto';
import { InformationResponseDto } from './dtos/information-response.dto';

@ApiTags('Information')
@Controller('information')
export class InformationController {
  constructor(private readonly service: InformationService) {}

  @Post()
  @ApiOperation({ summary: '创建新信息' })
  @ApiResponse({ type: InformationResponseDto })
  async create(@Body() dto: CreateInformationDto) {
    // 实际应用中应从Auth中获取
    const authorAddress = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F'; 
    return this.service.create(dto, authorAddress);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取信息详情' })
  @ApiResponse({ type: InformationResponseDto })
  async getById(@Param('id') id: string) {
    return this.service.getById(id);
  }

  @Get('search/tag')
  @ApiOperation({ summary: '按标签搜索' })
  @ApiResponse({ type: [InformationResponseDto] })
  async searchByTag(
    @Query('tag') tag: string,
    @Query('chainId') chainId?: number
  ) {
    return this.service.searchByTag(tag, chainId);
  }
}