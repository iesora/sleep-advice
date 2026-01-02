import { IsBoolean, IsOptional, IsUrl } from 'class-validator';

/**
 * モデル設定オプション
 */
export class ModelsDto {
  @IsOptional()
  @IsBoolean()
  face?: boolean;

  @IsOptional()
  @IsBoolean()
  prosody?: boolean;

  @IsOptional()
  @IsBoolean()
  transcript?: boolean;
}

/**
 * URLからジョブを作成するリクエストDTO
 */
export class CreateJobFromUrlDto {
  @IsUrl({}, { message: 'videoUrlは有効なURL形式である必要があります' })
  videoUrl: string;

  @IsOptional()
  models?: ModelsDto;
}
