import { Body, Controller, Post } from '@nestjs/common';
import { RagService } from './rag.service';
import { UpsertKnowledgeDto } from './dto/upsert-knowledge.dto';

@Controller('rag')
export class RagController {
  constructor(private readonly ragService: RagService) {}

  @Post('upsert')
  async upsert(@Body() dto: UpsertKnowledgeDto) {
    await this.ragService.upsertKnowledge(dto.chunks);
    return {
      success: true,
      message: `Successfully upserted ${dto.chunks.length} chunks`,
    };
  }
}
