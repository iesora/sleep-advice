import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { RagModule } from './rag/rag.module';
import { ChatModule } from './chat/chat.module';
import { HumeModule } from './hume/hume.module';
import { AssemblyAIModule } from './assemblyai/assemblyai.module';

@Module({
  imports: [ConfigModule, RagModule, ChatModule, HumeModule, AssemblyAIModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
