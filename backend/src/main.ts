import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ConfigService } from '@nestjs/config'
import { setupSwagger } from './common/swagger'
import { VersioningType } from '@nestjs/common'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  
  // 启用版本控制
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'v1'
  })

  // 全局前缀和跨域
  app.setGlobalPrefix('api')
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*'
  })

  // Swagger文档
  setupSwagger(app)

  const config = app.get(ConfigService)
  await app.listen(config.get('PORT') || 3000)
}
bootstrap()