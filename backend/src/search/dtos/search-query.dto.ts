import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsArray } from 'class-validator';

export class SearchQueryDto {
  @ApiProperty({ description: '搜索关键词' })
  @IsString()
  query: string;

  @ApiProperty({ 
    description: '过滤标签', 
    required: false,
    example: ['区块链', 'NFT']
  })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiProperty({ 
    description: '链ID过滤', 
    required: false,
    example: 56 
  })
  @IsOptional()
  chainId?: number;
}