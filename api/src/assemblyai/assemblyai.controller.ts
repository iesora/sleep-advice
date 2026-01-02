import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AssemblyAIService } from './assemblyai.service';
import { TranscribeDto } from './dto/transcribe.dto';

/**
 * AssemblyAI音声文字起こしAPIのコントローラー
 */
@Controller('transcribe')
export class AssemblyAIController {
  constructor(private readonly assemblyAIService: AssemblyAIService) {}

  /**
   * 音声URLから文字起こしを実行
   * POST /transcribe
   */
  @Post()
  @HttpCode(HttpStatus.OK)
  async transcribe(@Body() dto: TranscribeDto) {
    return await this.assemblyAIService.transcribe(dto);
  }
}
