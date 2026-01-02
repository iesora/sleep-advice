import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import FormData from 'form-data';
//import { CreateJobFromUrlDto, ModelsDto } from './dto/create-job-from-url.dto';

/**
 * Hume AI APIの設定
 */
interface HumeConfig {
  apiKey: string;
  baseUrl: string;
  enableTranscript: boolean;
  prosodyGranularity: string;
  maxFileSize: number; // bytes
  timeout: number; // milliseconds
}

/**
 * ジョブ作成オプション
 */
interface CreateJobOptions {
  face?: boolean;
  prosody?: boolean;
  transcript?: boolean;
}

/**
 * Hume AI APIとの通信を担当するサービス
 */
@Injectable()
export class HumeService {
  private readonly logger = new Logger(HumeService.name);
  private readonly config: HumeConfig;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('HUME_API_KEY');
    if (!apiKey) {
      throw new Error('HUME_API_KEY環境変数が設定されていません');
    }

    this.config = {
      apiKey,
      baseUrl:
        this.configService.get<string>('HUME_BASE_URL') ||
        'https://api.hume.ai',
      enableTranscript:
        this.configService.get<string>('HUME_ENABLE_TRANSCRIPT') === 'true',
      prosodyGranularity:
        this.configService.get<string>('HUME_PROSODY_GRANULARITY') ||
        'utterance',
      maxFileSize:
        parseInt(
          this.configService.get<string>('HUME_MAX_FILE_SIZE') || '104857600',
          10,
        ) || 104857600, // デフォルト100MB
      timeout:
        parseInt(
          this.configService.get<string>('HUME_TIMEOUT') || '60000',
          10,
        ) || 60000, // デフォルト60秒
    };

    // HttpServiceのデフォルト設定
    this.httpService.axiosRef.defaults.timeout = this.config.timeout;
    this.httpService.axiosRef.defaults.maxBodyLength = this.config.maxFileSize;
    this.httpService.axiosRef.defaults.maxContentLength =
      this.config.maxFileSize;
  }

  /**
   * URLからジョブを作成
   */
  async createJobFromUrl(
    videoUrl: string,
    opts?: CreateJobOptions,
  ): Promise<any> {
    const models = this.buildModelsConfig(opts);

    const requestBody = {
      models,
      urls: [videoUrl],
    };

    try {
      this.logger.log(`ジョブ作成開始: URL=${videoUrl.substring(0, 50)}...`);

      const response = await firstValueFrom(
        this.httpService.post(
          `${this.config.baseUrl}/v0/batch/jobs`,
          requestBody,
          {
            headers: {
              'X-Hume-Api-Key': this.config.apiKey,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      this.logger.log(`ジョブ作成成功: jobId=${response.data.job_id}`);

      return {
        jobId: response.data.job_id,
        status: response.data.state?.status || 'unknown',
        raw: response.data,
      };
    } catch (error: any) {
      this.handleHttpError(error, 'ジョブ作成');
    }
  }

  /**
   * ファイルアップロードからジョブを作成
   */
  async createJobFromFile(
    file: Express.Multer.File,
    opts?: CreateJobOptions,
  ): Promise<any> {
    // ファイルサイズチェック
    if (file.size > this.config.maxFileSize) {
      throw new HttpException(
        `ファイルサイズが上限を超えています。最大: ${this.config.maxFileSize} bytes`,
        HttpStatus.PAYLOAD_TOO_LARGE,
      );
    }

    // ファイル形式チェック
    const allowedMimeTypes = [
      'video/mp4',
      'video/webm',
      'video/quicktime', // mov
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new HttpException(
        `サポートされていないファイル形式です。許可: ${allowedMimeTypes.join(', ')}`,
        HttpStatus.UNSUPPORTED_MEDIA_TYPE,
      );
    }

    const models = this.buildModelsConfig(opts);

    // multipart/form-dataで送信
    const formData = new FormData();
    formData.append('json', JSON.stringify({ models }), {
      contentType: 'application/json',
    });
    formData.append('file', file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
    });

    try {
      this.logger.log(
        `ジョブ作成開始: ファイル=${file.originalname}, サイズ=${file.size} bytes`,
      );

      const response = await firstValueFrom(
        this.httpService.post(
          `${this.config.baseUrl}/v0/batch/jobs`,
          formData,
          {
            headers: {
              'X-Hume-Api-Key': this.config.apiKey,
              ...formData.getHeaders(),
            },
            maxBodyLength: this.config.maxFileSize,
            maxContentLength: this.config.maxFileSize,
          },
        ),
      );

      this.logger.log(`ジョブ作成成功: jobId=${response.data.job_id}`);

      return {
        jobId: response.data.job_id,
        status: response.data.state?.status || 'unknown',
        raw: response.data,
      };
    } catch (error: any) {
      this.handleHttpError(error, 'ジョブ作成');
    }
  }

  /**
   * ジョブの状態を取得
   */
  async getJob(jobId: string): Promise<any> {
    try {
      this.logger.log(`ジョブ取得: jobId=${jobId}`);

      const response = await firstValueFrom(
        this.httpService.get(`${this.config.baseUrl}/v0/batch/jobs/${jobId}`, {
          headers: {
            'X-Hume-Api-Key': this.config.apiKey,
          },
        }),
      );

      return {
        jobId: response.data.job_id,
        status: response.data.state?.status || 'unknown',
        raw: response.data,
      };
    } catch (error: any) {
      this.handleHttpError(error, 'ジョブ取得');
    }
  }

  /**
   * 予測結果を取得
   */
  async getPredictions(jobId: string): Promise<any> {
    try {
      this.logger.log(`予測取得: jobId=${jobId}`);

      const response = await firstValueFrom(
        this.httpService.get(
          `${this.config.baseUrl}/v0/batch/jobs/${jobId}/predictions`,
          {
            headers: {
              'X-Hume-Api-Key': this.config.apiKey,
              Accept: 'application/json',
            },
            // レスポンスが大きい可能性があるため、gzipを許可
            decompress: true,
          },
        ),
      );

      return response.data;
    } catch (error: any) {
      this.handleHttpError(error, '予測取得');
    }
  }

  /**
   * モデル設定を構築
   */
  private buildModelsConfig(opts?: CreateJobOptions): any {
    const defaultFace = true;
    const defaultProsody = true;
    const defaultTranscript = this.config.enableTranscript;

    const face = opts?.face ?? defaultFace;
    const prosody = opts?.prosody ?? defaultProsody;
    const transcript = opts?.transcript ?? defaultTranscript;

    const models: any = {};

    if (face) {
      models.face = {};
    }

    if (prosody) {
      models.prosody = {
        granularity: this.config.prosodyGranularity,
      };
    }

    if (transcript) {
      models.language = {};
    }

    return models;
  }

  /**
   * HTTPエラーを処理
   */
  private handleHttpError(error: any, operation: string): never {
    if (error.response) {
      // APIからのエラーレスポンス
      const status = error.response.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message =
        error.response.data?.message ||
        error.response.data?.error ||
        `${operation}に失敗しました`;

      this.logger.error(
        `${operation}エラー: status=${status}, message=${message}`,
      );

      throw new HttpException(
        {
          statusCode: status,
          message,
          error: error.response.data || 'Unknown error',
        },
        status,
      );
    } else if (error.request) {
      // リクエストは送信されたがレスポンスがない（タイムアウトなど）
      this.logger.error(`${operation}タイムアウトまたはネットワークエラー`);

      throw new HttpException(
        {
          statusCode: HttpStatus.REQUEST_TIMEOUT,
          message: `${operation}がタイムアウトしました`,
        },
        HttpStatus.REQUEST_TIMEOUT,
      );
    } else {
      // リクエスト設定時のエラー
      this.logger.error(`${operation}設定エラー: ${error.message}`);

      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: `${operation}中にエラーが発生しました: ${error.message}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
