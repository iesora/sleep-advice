import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';

@Injectable()
export class RagService {
  private openai: OpenAI;
  private pinecone: Pinecone;
  private indexName: string;
  private namespace: string;
  private embeddingModel: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    const pineconeApiKey = this.configService.get<string>('PINECONE_API_KEY');

    if (!apiKey || !pineconeApiKey) {
      throw new Error('OPENAI_API_KEY and PINECONE_API_KEY must be set');
    }

    this.openai = new OpenAI({ apiKey });
    this.pinecone = new Pinecone({ apiKey: pineconeApiKey });
    this.indexName =
      this.configService.get<string>('PINECONE_INDEX_NAME') ||
      'sleep-knowledge';
    this.namespace =
      this.configService.get<string>('PINECONE_NAMESPACE') || 'kb-ja';
    this.embeddingModel =
      this.configService.get<string>('OPENAI_EMBEDDING_MODEL') ||
      'text-embedding-3-small';
  }

  /**
   * テキストをベクトル化する
   */
  async embed(text: string): Promise<number[]> {
    const dimensionsStr = this.configService.get<string>(
      'OPENAI_EMBEDDING_DIMENSIONS',
    );
    const dimensions = dimensionsStr ? parseInt(dimensionsStr, 10) : undefined;

    const params: {
      model: string;
      input: string;
      dimensions?: number;
    } = {
      model: this.embeddingModel,
      input: text,
    };

    // dimensionsが指定されている場合（インデックスの次元数に合わせる）
    if (dimensions && !isNaN(dimensions)) {
      params.dimensions = dimensions;
    }

    const response = await this.openai.embeddings.create(params);

    return response.data[0].embedding;
  }

  /**
   * 知識チャンクをPineconeに登録
   */
  async upsertKnowledge(
    chunks: Array<{ id: string; text: string; metadata?: Record<string, any> }>,
  ): Promise<void> {
    const index = this.pinecone.index(this.indexName);

    // 各チャンクをベクトル化
    const vectors = await Promise.all(
      chunks.map(async (chunk) => {
        const embedding = await this.embed(chunk.text);
        return {
          id: chunk.id,
          values: embedding,
          metadata: {
            text: chunk.text,
            ...chunk.metadata,
          },
        };
      }),
    );

    // Pineconeにupsert
    await index.namespace(this.namespace).upsert(vectors);
  }

  /**
   * クエリに関連する知識を検索
   */
  async retrieve(
    query: string,
    topK: number = 5,
  ): Promise<Array<{ text: string; metadata?: Record<string, any> }>> {
    const index = this.pinecone.index(this.indexName);

    // クエリをベクトル化
    const queryEmbedding = await this.embed(query);

    // Pineconeで検索
    const queryResponse = await index.namespace(this.namespace).query({
      vector: queryEmbedding,
      topK,
      includeMetadata: true,
    });

    // 結果を整形
    return (
      queryResponse.matches?.map((match) => ({
        text: (match.metadata?.text as string) || '',
        metadata: match.metadata,
      })) || []
    );
  }
}
