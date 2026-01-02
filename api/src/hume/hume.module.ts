import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { HumeController } from './hume.controller';
import { HumeService } from './hume.service';

/**
 * Hume AI動画解析機能のモジュール
 */
@Module({
  imports: [
    HttpModule.register({
      timeout: 60000, // デフォルト60秒
      maxRedirects: 5,
    }),
  ],
  controllers: [HumeController],
  providers: [HumeService],
  exports: [HumeService],
})
export class HumeModule {}
