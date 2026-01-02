import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORSを有効化
  app.enableCors();

  // グローバルなバリデーションパイプを設定
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTOに定義されていないプロパティを除外
      forbidNonWhitelisted: true, // 定義されていないプロパティがある場合エラー
      transform: true, // 自動的に型変換
    }),
  );

  await app.listen(3000);
  console.log('Application is running on: http://localhost:3000');
}
bootstrap();
