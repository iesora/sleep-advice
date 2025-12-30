export class KnowledgeChunk {
  id: string;
  text: string;
  metadata?: Record<string, any>;
}

export class UpsertKnowledgeDto {
  chunks: KnowledgeChunk[];
}
