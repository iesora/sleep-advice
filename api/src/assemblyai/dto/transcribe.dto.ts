import { IsString, IsUrl } from 'class-validator';

/**
 * 音声文字起こしリクエストDTO
 */
export class TranscribeDto {
  @IsUrl({}, { message: 'audioUrlは有効なURL形式である必要があります' })
  @IsString()
  audioUrl: string;
}
