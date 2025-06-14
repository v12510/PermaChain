import { Injectable } from '@nestjs/common'
import { create, IPFSHTTPClient } from 'ipfs-http-client'
import { ConfigService } from '@nestjs/config'
import { Readable } from 'stream'

@Injectable()
export class IpfsService {
  private client: IPFSHTTPClient

  constructor(private config: ConfigService) {
    this.client = create({
      host: this.config.get('IPFS_API_HOST'),
      port: this.config.get('IPFS_API_PORT'),
      protocol: 'https',
      headers: {
        authorization: `Basic ${Buffer.from(
          `${this.config.get('IPFS_API_KEY')}:${this.config.get('IPFS_API_SECRET')}`
        ).toString('base64')}`
      }
    })
  }

  async upload(content: Buffer | string | Readable): Promise<string> {
    const { cid } = await this.client.add(content, {
      pin: true,
      timeout: 30000
    })
    return cid.toString()
  }

  async fetch(cid: string): Promise<string> {
    const chunks = []
    for await (const chunk of this.client.cat(cid)) {
      chunks.push(chunk)
    }
    return Buffer.concat(chunks).toString('utf-8')
  }
}