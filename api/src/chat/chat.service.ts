import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { RagService } from '../rag/rag.service';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

@Injectable()
export class ChatService {
  private openai: OpenAI;
  private model: string;
  private conversations: Map<string, ChatMessage[]> = new Map();

  constructor(
    private configService: ConfigService,
    private ragService: RagService,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY must be set');
    }

    this.openai = new OpenAI({ apiKey });
    this.model = this.configService.get<string>('OPENAI_MODEL') || 'gpt-4o';
  }

  /**
   * ユーザーの質問に対して回答を生成
   */
  async chat(userId: string, message: string): Promise<string> {
    // 関連知識を検索
    const knowledgeResults = await this.ragService.retrieve(message, 5);

    // 知識をテキストに整形
    const knowledgeContext = knowledgeResults
      .map((result, index) => `[知識${index + 1}]\n${result.text}`)
      .join('\n\n');

    // 会話履歴を取得（なければ初期化）
    const messages = this.conversations.get(userId) || [];

    // システムプロンプトを設定（初回のみ）
    if (messages.length === 0) {
      const systemPrompt = this.getSystemPrompt();
      messages.push({ role: 'system', content: systemPrompt });
    }

    // 知識コンテキストを含むユーザーメッセージを作成
    const userMessageWithContext = knowledgeContext
      ? `以下の知識を参考にして回答してください。\n\n${knowledgeContext}\n\n---\n\nユーザーの質問: ${message}`
      : message;

    messages.push({ role: 'user', content: userMessageWithContext });

    // OpenAI Responses APIで回答生成
    const response = await this.openai.chat.completions.create({
      model: this.model,
      messages:
        messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
      temperature: 0.7,
    });

    const assistantMessage =
      response.choices[0]?.message?.content ||
      '申し訳ございませんが、回答を生成できませんでした。';

    // 会話履歴に追加
    messages.push({ role: 'assistant', content: assistantMessage });
    this.conversations.set(userId, messages);

    return assistantMessage;
  }

  /**
   * システムプロンプトを生成
   */
  private getSystemPrompt(): string {
    return `あなたは睡眠に関する一般的なアドバイスを提供するチャットボットです。

重要なルール:
1. 睡眠の一般的なアドバイス（睡眠衛生）のみを提供してください
2. 診断・処方は絶対に行わないでください
3. 提案は1〜3個に絞って簡潔に伝えてください
4. 以下の危険兆候が見られる場合は、必ず医療機関の受診を促してください:
   - 強い日中眠気（日常生活に支障をきたす）
   - 睡眠時無呼吸の疑い（いびき、呼吸停止など）
   - 重度の抑うつ症状
   - その他、深刻な健康問題の可能性

回答の最後には、必ず確認質問を1つ含めてください（例：「他に気になる症状はありますか？」「このアドバイスを試してみて、どう感じましたか？」など）。

知識ベースから提供された情報を根拠として使用し、分かりやすく親切に回答してください。`;
  }
}
