<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## Hume AI 動画解析機能

このアプリケーションには、Hume AI APIを使用した動画解析機能が実装されています。

### 環境変数の設定

`.env`ファイルに以下の環境変数を設定してください：

```bash
# 必須
HUME_API_KEY=your-api-key-here

# オプション
HUME_BASE_URL=https://api.hume.ai  # デフォルト値
HUME_ENABLE_TRANSCRIPT=false        # "true"にするとtranscriptを有効化
HUME_PROSODY_GRANULARITY=utterance  # デフォルト値
HUME_MAX_FILE_SIZE=104857600        # デフォルト100MB（bytes）
HUME_TIMEOUT=60000                  # デフォルト60秒（milliseconds）
```

### API エンドポイント

#### 1. URLからジョブを作成

```bash
curl -X POST http://localhost:3000/hume/jobs/url \
  -H "Content-Type: application/json" \
  -d '{
    "videoUrl": "https://example.com/video.mp4",
    "models": {
      "face": true,
      "prosody": true,
      "transcript": false
    }
  }'
```

**レスポンス例:**
```json
{
  "jobId": "job-12345",
  "status": "QUEUED",
  "raw": { ... }
}
```

#### 2. ファイルアップロードからジョブを作成

```bash
curl -X POST http://localhost:3000/hume/jobs/upload \
  -F "file=@/path/to/video.mp4" \
  -F 'models={"face":true,"prosody":true,"transcript":false}'
```

**注意:** `models`パラメータはオプションです。省略した場合、デフォルト設定（face=true, prosody=true, transcript=HUME_ENABLE_TRANSCRIPTの値）が使用されます。

#### 3. ジョブの状態を取得

```bash
curl http://localhost:3000/hume/jobs/job-12345
```

**レスポンス例:**
```json
{
  "jobId": "job-12345",
  "status": "COMPLETED",
  "raw": { ... }
}
```

#### 4. 予測結果を取得

```bash
curl http://localhost:3000/hume/jobs/job-12345/predictions
```

**注意:** 予測結果は非常に大きくなる可能性があります。本番環境では、gzip圧縮を有効化することを推奨します。

### モデル設定

- **face**: 表情解析（デフォルト: true）
- **prosody**: 声の特徴量解析（デフォルト: true）
- **transcript**: 会話文（speech-to-text）取得（デフォルト: HUME_ENABLE_TRANSCRIPT環境変数の値）

### よくある落とし穴と注意事項

1. **動画サイズ**: 
   - デフォルトで100MBまで。大きなファイルを処理する場合は`HUME_MAX_FILE_SIZE`を調整してください。
   - 動画が大きいほど処理時間が長くなります。

2. **レスポンスサイズ**: 
   - 予測結果は非常に大きくなる可能性があります（数MB〜数十MB）。
   - 本番環境では、NestJSの`compression`ミドルウェアを有効化することを推奨します：
     ```bash
     npm install compression
     npm install --save-dev @types/compression
     ```
     その後、`main.ts`で有効化：
     ```typescript
     import * as compression from 'compression';
     app.use(compression());
     ```

3. **Webhookの推奨**: 
   - ジョブの完了を待つためにポーリングするのではなく、Hume AIのWebhook機能を使用することを推奨します。
   - これにより、サーバーリソースの無駄を削減できます。

4. **タイムアウト**: 
   - デフォルトで60秒。大きなファイルやネットワークが遅い場合は`HUME_TIMEOUT`を調整してください。

5. **ファイル形式**: 
   - サポートされている形式: MP4, WebM, MOV（QuickTime）
   - 他の形式を使用する場合は、事前に変換してください。

6. **APIキーのセキュリティ**: 
   - APIキーはログに出力されませんが、環境変数として安全に管理してください。
   - `.env`ファイルは`.gitignore`に含まれていることを確認してください。

### テスト

```bash
# ユニットテスト
npm run test hume.service.spec

# カバレッジ
npm run test:cov
```

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
