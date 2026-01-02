import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
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
    try {
      this.logger.log(
        `文字起こし開始: audioUrl=${dto.audioUrl.substring(0, 50)}...`,
      );

      const params = {
        audio: dto.audioUrl,
        speech_models: ['universal'],
      };

      const transcript = await this.client.transcripts.transcribe(params);

      this.logger.log(`文字起こし成功: transcriptId=${transcript.id}`);

      return {
        id: transcript.id,
        text: transcript.text,
        status: transcript.status,
        audioUrl: dto.audioUrl,
      };
    } catch (error: any) {
      this.logger.error(`文字起こしエラー: ${error.message}`, error.stack);

      // AssemblyAI SDKのエラーを適切にハンドリング
      if (error.status_code) {
        throw new HttpException(
          {
            statusCode: error.status_code,
            message: error.message || '文字起こしに失敗しました',
            error: error,
          },
          error.status_code,
        );
      }

      // その他のエラー
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: `文字起こし中にエラーが発生しました: ${error.message}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
