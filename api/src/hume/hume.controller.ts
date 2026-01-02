import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { HumeService } from './hume.service';
import { CreateJobFromUrlDto } from './dto/create-job-from-url.dto';

/**
 * Hume AI動画解析APIのコントローラー
 */
@Controller('hume/jobs')
export class HumeController {
  constructor(private readonly humeService: HumeService) {}

  /**
   * URLからジョブを作成
   * POST /hume/jobs/url
   */
  @Post('url')
  async createJobFromUrl(@Body() dto: CreateJobFromUrlDto) {
    return await this.humeService.createJobFromUrl(dto.videoUrl, dto.models);
  }

  /**
   * ファイルアップロードからジョブを作成
   * POST /hume/jobs/upload
   */
  /**
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async createJobFromUpload(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          // ファイルサイズはサービス側でもチェックするが、ここでも制限
          new MaxFileSizeValidator({ maxSize: 104857600 }), // 100MB
          // ファイル形式チェック
          new FileTypeValidator({
            fileType: /(video\/mp4|video\/webm|video\/quicktime)/,
          }),
        ],
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      }),
    )
    file: Express.Multer.File,
    @Body('models') models?: any, // オプショナルなmodelsパラメータ（JSON文字列として送信される可能性がある）
  ) {
    // modelsが文字列の場合はパース
    let parsedModels;
    if (models) {
      try {
        parsedModels = typeof models === 'string' ? JSON.parse(models) : models;
      } catch {
        parsedModels = models;
      }
    }

    return await this.humeService.createJobFromFile(file, parsedModels);
  }
     */

  /**
   * ジョブの状態を取得
   * GET /hume/jobs/:id
   */
  @Get(':id')
  async getJob(@Param('id') jobId: string) {
    return await this.humeService.getJob(jobId);
  }

  /**
   * 予測結果を取得
   * GET /hume/jobs/:id/predictions
   */
  @Get(':id/predictions')
  async getPredictions(@Param('id') jobId: string) {
    return await this.humeService.getPredictions(jobId);
  }
}
