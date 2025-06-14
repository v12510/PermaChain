import { ApiProperty } from '@nestjs/swagger';

export class InformationResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: '区块链基础知识' })
  title: string;

  @ApiProperty({ example: '区块链是一种分布式账本技术...' })
  content: string;

  @ApiProperty({ example: ['区块链', '入门'] })
  tags: string[];

  @ApiProperty({ example: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F' })
  authorAddress: string;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  createdAt: Date;
}