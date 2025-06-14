import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { StorageService } from '../storage/storage.service'
import { ApiConsumes, ApiBody, ApiResponse } from '@nestjs/swagger'

@Controller('upload')
export class UploadController {
  constructor(private storage: StorageService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: '返回IPFS哈希和云存储URL',
    schema: {
      example: {
        ipfsHash: 'Qm...',
        storageUrl: 'https://...'
      }
    }
  })
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.storage.upload({
      originalname: file.originalname,
      buffer: file.buffer,
      mimetype: file.mimetype
    })
  }
}