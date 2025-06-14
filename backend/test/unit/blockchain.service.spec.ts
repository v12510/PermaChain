import { Test } from '@nestjs/testing'
import { BlockchainService } from '../../src/blockchain/services/blockchain.service'
import { ConfigModule } from '@nestjs/config'

describe('BlockchainService', () => {
  let service: BlockchainService

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [BlockchainService],
    }).compile()

    service = module.get<BlockchainService>(BlockchainService)
  })

  it('should initialize providers', () => {
    expect(service['providers'].size).toBeGreaterThan(0)
  })

  it('should throw error for unsupported chain', async () => {
    await expect(service.getInformation(999, 1)).rejects.toThrow()
  })
})