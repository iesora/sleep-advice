import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AssemblyAIController } from './assemblyai.controller';
import { AssemblyAIService } from './assemblyai.service';

/**
 * AssemblyAI音声文字起こし機能のモジュール
 */
@Module({
  imports: [ConfigModule],
  controllers: [AssemblyAIController],
  providers: [AssemblyAIService],
  exports: [AssemblyAIService],
})
export class AssemblyAIModule {}
