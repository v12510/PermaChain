import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsNumber, IsOptional } from 'class-validator';

export class CreateInformationDto {
  @ApiProperty({ example: '区块链基础知识' })
  @IsString()
  title: string;

  @ApiProperty({ example: '区块链是一种分布式账本技术...' })
  @IsString()
  content: string;

  @ApiProperty({ example: ['区块链', '入门'] })
  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @ApiProperty({ required: false, example: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco' })
  @IsString()
  @IsOptional()
  contentHash?: string;

  @ApiProperty({ required: false, example: 56 })
  @IsNumber()
  @IsOptional()
  chainId?: number;
}