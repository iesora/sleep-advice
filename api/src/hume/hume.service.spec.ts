import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { HttpException } from '@nestjs/common';
import { HumeService } from './hume.service';

describe('HumeService', () => {
  let service: HumeService;

  const mockHttpService = {
    post: jest.fn(),
    get: jest.fn(),
    axiosRef: {
      defaults: {
        timeout: 60000,
        maxBodyLength: 104857600,
        maxContentLength: 104857600,
      },
    },
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, any> = {
        HUME_API_KEY: 'test-api-key',
        HUME_BASE_URL: 'https://api.hume.ai',
        HUME_ENABLE_TRANSCRIPT: 'false',
        HUME_PROSODY_GRANULARITY: 'utterance',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HumeService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<HumeService>(HumeService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createJobFromUrl', () => {
    it('URLからジョブを作成できる', async () => {
      const mockResponse = {
        data: {
          job_id: 'test-job-id',
          state: { status: 'QUEUED' },
        },
      };

      mockHttpService.post.mockReturnValue(of(mockResponse));

      const result = await service.createJobFromUrl(
        'https://example.com/video.mp4',
      );

      expect(result).toEqual({
        jobId: 'test-job-id',
        status: 'QUEUED',
        raw: mockResponse.data,
      });
      expect(mockHttpService.post).toHaveBeenCalledWith(
        'https://api.hume.ai/v0/batch/jobs',
        expect.objectContaining({
          urls: ['https://example.com/video.mp4'],
        }),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Hume-Api-Key': 'test-api-key',
          }),
        }),
      );
    });

    it('APIエラー時にHttpExceptionをスローする', async () => {
      const mockError = {
        response: {
          status: 400,
          data: { message: 'Invalid URL' },
        },
      };

      mockHttpService.post.mockReturnValue(throwError(() => mockError));

      await expect(service.createJobFromUrl('invalid-url')).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('createJobFromFile', () => {
    const mockFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'test.mp4',
      encoding: '7bit',
      mimetype: 'video/mp4',
      size: 1024,
      buffer: Buffer.from('test'),
      destination: '',
      filename: '',
      path: '',
      stream: null as any,
    };

    it('ファイルからジョブを作成できる', async () => {
      const mockResponse = {
        data: {
          job_id: 'test-job-id',
          state: { status: 'QUEUED' },
        },
      };

      mockHttpService.post.mockReturnValue(of(mockResponse));

      const result = await service.createJobFromFile(mockFile);

      expect(result).toEqual({
        jobId: 'test-job-id',
        status: 'QUEUED',
        raw: mockResponse.data,
      });
    });

    it('ファイルサイズが上限を超えている場合エラー', async () => {
      const largeFile = { ...mockFile, size: 200000000 }; // 200MB

      await expect(service.createJobFromFile(largeFile)).rejects.toThrow(
        HttpException,
      );
    });

    it('サポートされていないファイル形式の場合エラー', async () => {
      const invalidFile = { ...mockFile, mimetype: 'video/avi' };

      await expect(service.createJobFromFile(invalidFile)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('getJob', () => {
    it('ジョブの状態を取得できる', async () => {
      const mockResponse = {
        data: {
          job_id: 'test-job-id',
          state: { status: 'COMPLETED' },
        },
      };

      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.getJob('test-job-id');

      expect(result).toEqual({
        jobId: 'test-job-id',
        status: 'COMPLETED',
        raw: mockResponse.data,
      });
    });
  });

  describe('getPredictions', () => {
    it('予測結果を取得できる', async () => {
      const mockResponse = {
        data: {
          results: [
            {
              source: { type: 'url' },
              results: {
                predictions: [],
              },
            },
          ],
        },
      };

      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.getPredictions('test-job-id');

      expect(result).toEqual(mockResponse.data);
    });
  });
});
