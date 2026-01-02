import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { RagModule } from './rag/rag.module';
import { ChatModule } from './chat/chat.module';
import { HumeModule } from './hume/hume.module';

@Module({
  imports: [ConfigModule, RagModule, ChatModule, HumeModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
