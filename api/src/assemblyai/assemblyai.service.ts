import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AssemblyAI } from 'assemblyai';
import { TranscribeDto } from './dto/transcribe.dto';

/**
 * AssemblyAI音声文字起こしサービス
 */
@Injectable()
export class AssemblyAIService {
  private readonly logger = new Logger(AssemblyAIService.name);
  private readonly client: AssemblyAI;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('ASSEMBLYAI_API_KEY');
    if (!apiKey) {
      throw new Error('ASSEMBLYAI_API_KEY環境変数が設定されていません');
    }

    this.client = new AssemblyAI({
      apiKey: apiKey,
    });

    this.logger.log('AssemblyAIクライアントを初期化しました');
  }

  /**
   * 音声URLから文字起こしを実行
   */
  async transcribe(dto: TranscribeDto): Promise<any> {
    console.log(dto);

    this.logger.log(
      `文字起こし開始: audioUrl=${dto.audioUrl.substring(0, 50)}...`,
    );

    const params = {
      audio: dto.audioUrl,
      speech_models: ['universal'],
      language_code: 'ja',
    };

    const transcript = await this.client.transcripts.transcribe(params);

    console.log('assemblyai transcript:', transcript);

    this.logger.log(`文字起こし成功: transcriptId=${transcript.id}`);

    return {
      id: transcript.id,
      text: transcript.text,
      status: transcript.status,
      audioUrl: dto.audioUrl,
    };
  }
}
