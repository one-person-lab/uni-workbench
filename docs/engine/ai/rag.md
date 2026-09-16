# RAG 模块详细设计

## 一、模块概述

RAG（Retrieval-Augmented Generation）模块负责将用户问题与知识库结合，生成带有引用的答案。

## 二、核心组件

### 2.1 文档分块器（Chunker）

**职责：**
- 将文档分割成小块
- 保留语义完整性
- 支持多种分块策略

**接口：**
```typescript
interface Chunker {
  chunk(document: Document, options: ChunkOptions): DocumentChunk[]
}

interface ChunkOptions {
  strategy: 'fixed' | 'semantic' | 'recursive'
  chunkSize: number
  chunkOverlap: number
  minChunkSize?: number
}

interface DocumentChunk {
  id: string
  documentId: string
  content: string
  metadata: {
    title: string
    path: string
    section: string
    chunkIndex: number
    chunkCount: number
    startChar: number
    endChar: number
  }
}
```

**分块策略：**

1. **Fixed（固定大小）**
   - 按字符数分割
   - 固定重叠
   - 简单快速

2. **Semantic（语义）**
   - 按段落分割
   - 保持语义完整
   - 基于句子边界

3. **Recursive（递归）**
   - 递归分割
   - 优先保持大块
   - 降级到小块

**实现：**
```javascript
// server/ai/rag/chunking.mjs

export class FixedChunker {
  constructor(options = {}) {
    this.chunkSize = options.chunkSize || 512;
    this.chunkOverlap = options.chunkOverlap || 50;
  }

  chunk(document) {
    const chunks = [];
    const content = document.content;
    const totalLength = content.length;

    for (let i = 0; i < totalLength; i += this.chunkSize - this.chunkOverlap) {
      const start = i;
      const end = Math.min(i + this.chunkSize, totalLength);
      const chunkContent = content.slice(start, end);

      chunks.push({
        id: `${document.id}-${chunks.length}`,
        documentId: document.id,
        content: chunkContent,
        metadata: {
          title: document.title,
          path: document.path,
          section: document.section,
          chunkIndex: chunks.length,
          chunkCount: Math.ceil(totalLength / (this.chunkSize - this.chunkOverlap)),
          startChar: start,
          endChar: end,
        },
      });
    }

    return chunks;
  }
}

export class SemanticChunker {
  constructor(options = {}) {
    this.chunkSize = options.chunkSize || 512;
    this.chunkOverlap = options.chunkOverlap || 50;
  }

  chunk(document) {
    const chunks = [];
    const paragraphs = document.content.split(/\n\n+/);
    let currentChunk = '';
    let chunkIndex = 0;

    for (const paragraph of paragraphs) {
      if (currentChunk.length + paragraph.length > this.chunkSize) {
        if (currentChunk) {
          chunks.push(this.createChunk(document, currentChunk, chunkIndex));
          chunkIndex++;
          currentChunk = '';
        }
      }
      currentChunk += paragraph + '\n\n';
    }

    if (currentChunk) {
      chunks.push(this.createChunk(document, currentChunk, chunkIndex));
    }

    return chunks;
  }

  createChunk(document, content, index) {
    return {
      id: `${document.id}-${index}`,
      documentId: document.id,
      content: content.trim(),
      metadata: {
        title: document.title,
        path: document.path,
        section: document.section,
        chunkIndex: index,
        chunkCount: 0, // 未知
        startChar: 0,
        endChar: content.length,
      },
    };
  }
}
```

### 2.2 Embedding Provider

**职责：**
- 将文本转换为向量
- 支持批量处理
- 处理速率限制

**接口：**
```typescript
interface EmbeddingProvider {
  embed(text: string): Promise<number[]>
  embedBatch(texts: string[]): Promise<number[][]>
}
```

**实现：**
```javascript
// server/ai/embedding/openai-embedding.mjs

export class OpenAIEmbeddingProvider {
  constructor(config) {
    this.baseUrl = config.baseUrl;
    this.apiKey = config.apiKey;
    this.model = config.model;
    this.dimensions = config.dimensions || 1536;
    this.timeout = config.timeout || 30000;
  }

  async embed(text) {
    const response = await fetch(`${this.baseUrl}/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        input: text,
      }),
      signal: AbortSignal.timeout(this.timeout),
    });

    const data = await response.json();
    return data.data[0].embedding;
  }

  async embedBatch(texts) {
    const batchSize = 100;
    const results = [];

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const response = await fetch(`${this.baseUrl}/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          input: batch,
        }),
        signal: AbortSignal.timeout(this.timeout),
      });

      const data = await response.json();
      results.push(...data.data.map(item => item.embedding));
    }

    return results;
  }
}
```

### 2.3 Vector Store

**职责：**
- 存储和检索向量
- 相似度搜索
- 批量操作

**接口：**
```typescript
interface VectorStore {
  insert(chunk: DocumentChunk, embedding: number[]): Promise<void>
  insertBatch(chunks: DocumentChunk[], embeddings: number[][]): Promise<void>
  search(queryEmbedding: number[], topK: number, filters?: SearchFilters): Promise<SearchResult[]>
  delete(chunkId: string): Promise<void>
  deleteByDocumentId(documentId: string): Promise<void>
}

interface SearchResult {
  chunk: DocumentChunk
  score: number
}

interface SearchFilters {
  knowledgeBaseId?: string
  section?: string
  tags?: string[]
}
```

**实现（pgvector）：**
```javascript
// server/ai/vector/pgvector-store.mjs

import pg from 'pg';

export class PgVectorStore {
  constructor(config) {
    this.pool = new pg.Pool({
      connectionString: config.databaseUrl,
    });
    this.tableName = config.tableName || 'document_chunks';
    this.dimensions = config.dimensions || 1536;
  }

  async initialize() {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS ${this.tableName} (
        id TEXT PRIMARY KEY,
        document_id TEXT NOT NULL,
        content TEXT NOT NULL,
        metadata JSONB NOT NULL,
        embedding vector(${this.dimensions}),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await this.pool.query(`
      CREATE INDEX IF NOT EXISTS ${this.tableName}_embedding_idx
      ON ${this.tableName}
      USING ivfflat (embedding vector_cosine_ops)
      WITH (lists = 100)
    `);

    await this.pool.query(`
      CREATE INDEX IF NOT EXISTS ${this.tableName}_document_id_idx
      ON ${this.tableName} (document_id)
    `);
  }

  async insert(chunk, embedding) {
    await this.pool.query(
      `INSERT INTO ${this.tableName} (id, document_id, content, metadata, embedding)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE SET
         content = $3,
         metadata = $4,
         embedding = $5`,
      [chunk.id, chunk.documentId, chunk.content, JSON.stringify(chunk.metadata), `[${embedding.join(',')}]`]
    );
  }

  async insertBatch(chunks, embeddings) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      for (let i = 0; i < chunks.length; i++) {
        await client.query(
          `INSERT INTO ${this.tableName} (id, document_id, content, metadata, embedding)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (id) DO UPDATE SET
             content = $3,
             metadata = $4,
             embedding = $5`,
          [
            chunks[i].id,
            chunks[i].documentId,
            chunks[i].content,
            JSON.stringify(chunks[i].metadata),
            `[${embeddings[i].join(',')}]`
          ]
        );
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async search(queryEmbedding, topK, filters = {}) {
    let query = `
      SELECT id, document_id, content, metadata, 1 - (embedding <=> $1) as score
      FROM ${this.tableName}
      WHERE 1=1
    `;
    const params = [`[${queryEmbedding.join(',')}]`];
    let paramIndex = 2;

    if (filters.knowledgeBaseId) {
      query += ` AND metadata->>'knowledgeBaseId' = $${paramIndex}`;
      params.push(filters.knowledgeBaseId);
      paramIndex++;
    }

    if (filters.section) {
      query += ` AND metadata->>'section' = $${paramIndex}`;
      params.push(filters.section);
      paramIndex++;
    }

    query += ` ORDER BY embedding <=> $1 LIMIT $${paramIndex}`;
    params.push(topK);

    const result = await this.pool.query(query, params);

    return result.rows.map(row => ({
      chunk: {
        id: row.id,
        documentId: row.document_id,
        content: row.content,
        metadata: row.metadata,
      },
      score: row.score,
    }));
  }

  async delete(chunkId) {
    await this.pool.query(`DELETE FROM ${this.tableName} WHERE id = $1`, [chunkId]);
  }

  async deleteByDocumentId(documentId) {
    await this.pool.query(`DELETE FROM ${this.tableName} WHERE document_id = $1`, [documentId]);
  }
}
```

### 2.4 检索器（Retriever）

**职责：**
- 处理查询
- 调用 Embedding
- 调用 Vector Store
- 返回检索结果

**接口：**
```typescript
interface Retriever {
  retrieve(query: string, options: RetrieveOptions): Promise<RetrievalResult>
}

interface RetrieveOptions {
  topK: number
  filters?: SearchFilters
  rerank?: boolean
}

interface RetrievalResult {
  query: string
  queryEmbedding: number[]
  results: SearchResult[]
  retrievalTime: number
}
```

**实现：**
```javascript
// server/ai/rag/retrieval.mjs

export class Retriever {
  constructor(embeddingProvider, vectorStore) {
    this.embeddingProvider = embeddingProvider;
    this.vectorStore = vectorStore;
  }

  async retrieve(query, options = {}) {
    const startTime = Date.now();

    // 1. 向量化查询
    const queryEmbedding = await this.embeddingProvider.embed(query);

    // 2. 检索相关文档
    const results = await this.vectorStore.search(
      queryEmbedding,
      options.topK || 5,
      options.filters
    );

    const retrievalTime = Date.now() - startTime;

    return {
      query,
      queryEmbedding,
      results,
      retrievalTime,
    };
  }
}
```

### 2.5 上下文构建器（Context Builder）

**职责：**
- 将检索结果构建成上下文
- 添加来源信息
- 控制上下文长度

**接口：**
```typescript
interface ContextBuilder {
  build(retrievalResult: RetrievalResult, options: ContextOptions): Promise<Context>
}

interface ContextOptions {
  maxTokens: number
  includeMetadata: boolean
}

interface Context {
  text: string
  sources: Source[]
  tokenCount: number
}

interface Source {
  chunkId: string
  documentId: string
  title: string
  path: string
  score: number
}
```

**实现：**
```javascript
// server/ai/rag/context-builder.mjs

export class ContextBuilder {
  constructor(options = {}) {
    this.maxTokens = options.maxTokens || 4000;
    this.includeMetadata = options.includeMetadata !== false;
  }

  build(retrievalResult, options = {}) {
    const maxTokens = options.maxTokens || this.maxTokens;
    const includeMetadata = options.includeMetadata ?? this.includeMetadata;

    let contextText = '';
    const sources = [];
    let totalTokens = 0;

    for (const result of retrievalResult.results) {
      const chunk = result.chunk;
      const tokens = this.estimateTokens(chunk.content);

      if (totalTokens + tokens > maxTokens) {
        break;
      }

      if (includeMetadata) {
        contextText += `[${chunk.metadata.title}](${chunk.metadata.path})\n`;
      }

      contextText += chunk.content + '\n\n';
      totalTokens += tokens;

      sources.push({
        chunkId: chunk.id,
        documentId: chunk.documentId,
        title: chunk.metadata.title,
        path: chunk.metadata.path,
        score: result.score,
      });
    }

    return {
      text: contextText.trim(),
      sources,
      tokenCount: totalTokens,
    };
  }

  estimateTokens(text) {
    // 粗略估计：1 token ≈ 4 字符（英文）或 1.5 字符（中文）
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    const otherChars = text.length - chineseChars;
    return Math.ceil(chineseChars / 1.5 + otherChars / 4);
  }
}
```

### 2.6 RAG Service

**职责：**
- 协调所有组件
- 提供统一接口
- 处理错误

**接口：**
```typescript
interface RAGService {
  // 检索
  retrieve(query: string, options: RetrieveOptions): Promise<RetrievalResult>

  // 问答
  answer(query: string, context: string): Promise<Answer>

  // 对话
  chat(conversationId: string, message: string): Promise<ChatResponse>

  // 索引文档
  indexDocument(document: Document): Promise<void>

  // 索引知识库
  indexKnowledgeBase(knowledgeBaseId: string): Promise<void>
}
```

**实现：**
```javascript
// server/ai/rag/rag-service.mjs

export class RAGService {
  constructor(config) {
    this.chunker = new FixedChunker(config.chunking);
    this.embeddingProvider = new OpenAIEmbeddingProvider(config.embedding);
    this.vectorStore = new PgVectorStore(config.vector);
    this.retriever = new Retriever(this.embeddingProvider, this.vectorStore);
    this.contextBuilder = new ContextBuilder(config.context);
    this.llmProvider = new OpenAIClient(config.llm);
  }

  async retrieve(query, options = {}) {
    return await this.retriever.retrieve(query, options);
  }

  async answer(query, context) {
    const prompt = `
根据以下上下文回答问题。如果上下文中没有相关信息，请明确说明。

上下文：
${context}

问题：
${query}

回答：
`;

    const response = await this.llmProvider.chat([
      { role: 'system', content: '你是一个专业的助手，能够根据提供的上下文准确回答问题。' },
      { role: 'user', content: prompt },
    ]);

    return {
      answer: response.content,
      model: response.model,
      usage: response.usage,
    };
  }

  async chat(conversationId, message) {
    // 1. 检索相关文档
    const retrievalResult = await this.retrieve(message, { topK: 5 });

    // 2. 构建上下文
    const context = this.contextBuilder.build(retrievalResult);

    // 3. 生成回答
    const answer = await this.answer(message, context.text);

    // 4. 保存消息和检索记录
    await this.saveMessage(conversationId, message, answer, retrievalResult, context);

    return {
      answer: answer.answer,
      sources: context.sources,
      retrieval: retrievalResult,
    };
  }

  async indexDocument(document) {
    // 1. 分块
    const chunks = this.chunker.chunk(document);

    // 2. 向量化
    const texts = chunks.map(chunk => chunk.content);
    const embeddings = await this.embeddingProvider.embedBatch(texts);

    // 3. 存储到向量数据库
    await this.vectorStore.insertBatch(chunks, embeddings);
  }

  async indexKnowledgeBase(knowledgeBaseId) {
    // 1. 获取知识库中的所有文档
    const documents = await this.getDocumentsByKnowledgeBase(knowledgeBaseId);

    // 2. 索引每个文档
    for (const document of documents) {
      await this.indexDocument(document);
    }
  }

  async saveMessage(conversationId, message, answer, retrievalResult, context) {
    // 保存到数据库
    // ...
  }
}
```

## 三、API 设计

### 3.1 知识库管理

```javascript
// 创建知识库
POST /api/ai/knowledge-bases
{
  "name": "Career Knowledge",
  "description": "Career related knowledge",
  "vaultPath": "/path/to/vault"
}

// 列出知识库
GET /api/ai/knowledge-bases

// 获取知识库详情
GET /api/ai/knowledge-bases/:id

// 删除知识库
DELETE /api/ai/knowledge-bases/:id

// 索引知识库
POST /api/ai/knowledge-bases/:id/index
```

### 3.2 对话管理

```javascript
// 创建对话
POST /api/ai/conversations
{
  "knowledgeBaseId": "kb-xxx",
  "title": "Interview Preparation"
}

// 获取对话详情
GET /api/ai/conversations/:id

// 获取对话消息
GET /api/ai/conversations/:id/messages

// 发送消息
POST /api/ai/conversations/:id/messages
{
  "content": "无人机项目为什么需要视频转码？"
}
```

### 3.3 检索

```javascript
// 检索相关文档
POST /api/ai/retrieve
{
  "query": "无人机项目为什么需要视频转码？",
  "topK": 5,
  "filters": {
    "knowledgeBaseId": "kb-xxx"
  }
}

// 获取检索详情
GET /api/ai/retrieve/:id
```

## 四、前端设计

### 4.1 AI Q&A 页面

**组件结构：**
```
AIQAPage
├─ ConversationPanel
│  ├─ MessageList
│  │  ├─ UserMessage
│  │  └─ AssistantMessage
│  │     ├─ Answer
│  │     └─ Citations
│  └─ InputArea
└─ RetrievalDebug
   ├─ Query
   ├─ RetrievedChunks
   └─ Scores
```

**关键功能：**
- 对话界面
- 引用展示
- 检索调试
- 知识库选择

### 4.2 Hooks

```javascript
// useRAGConversation
export function useRAGConversation(conversationId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (content) => {
    setLoading(true);
    const response = await fetch(`/api/ai/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    const data = await response.json();
    setMessages([...messages, data]);
    setLoading(false);
  };

  return { messages, sendMessage, loading };
}
```

## 五、配置

### 5.1 环境变量

```bash
# RAG
RAG_CHUNK_SIZE=512
RAG_CHUNK_OVERLAP=50
RAG_MAX_RETRIEVAL_COUNT=5
RAG_MAX_CONTEXT_TOKENS=4000
```

### 5.2 配置文件

```javascript
// config/ai-config.mjs
export const ragConfig = {
  chunking: {
    strategy: 'fixed',
    chunkSize: 512,
    chunkOverlap: 50,
  },
  retrieval: {
    topK: 5,
    rerank: false,
  },
  context: {
    maxTokens: 4000,
    includeMetadata: true,
  },
};
```

## 六、测试

### 6.1 单元测试

```javascript
// tests/rag/chunking.test.mjs
import { describe, it } from 'node:test';
import { FixedChunker } from '../server/ai/rag/chunking.mjs';

describe('FixedChunker', () => {
  it('should chunk document correctly', () => {
    const chunker = new FixedChunker({ chunkSize: 100, chunkOverlap: 20 });
    const document = { id: 'doc-1', content: 'a'.repeat(500) };
    const chunks = chunker.chunk(document);
    assert.strictEqual(chunks.length, 6);
  });
});
```

### 6.2 集成测试

```javascript
// tests/rag/rag-service.test.mjs
import { describe, it } from 'node:test';
import { RAGService } from '../server/ai/rag/rag-service.mjs';

describe('RAGService', () => {
  it('should retrieve and answer', async () => {
    const ragService = new RAGService(config);
    const retrievalResult = await ragService.retrieve('test query');
    assert.ok(retrievalResult.results.length > 0);
  });
});
```

## 七、性能优化

### 7.1 缓存

```javascript
// Embedding 缓存
class EmbeddingCache {
  constructor() {
    this.cache = new Map();
    this.ttl = 24 * 60 * 60 * 1000; // 24 小时
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    return item.value;
  }

  set(key, value) {
    this.cache.set(key, { value, timestamp: Date.now() });
  }
}
```

### 7.2 批量处理

```javascript
// 批量 Embedding
async embedBatch(texts) {
  const batchSize = 100;
  const results = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const embeddings = await this.embedBatch(batch);
    results.push(...embeddings);
  }

  return results;
}
```

## 八、错误处理

### 8.1 错误类型

```javascript
class RAGError extends Error {
  constructor(code, message, details) {
    super(message);
    this.code = code;
    this.details = details;
  }
}

export const RAGErrorCodes = {
  CHUNKING_FAILED: 'RAG_CHUNKING_FAILED',
  EMBEDDING_FAILED: 'RAG_EMBEDDING_FAILED',
  RETRIEVAL_FAILED: 'RAG_RETRIEVAL_FAILED',
  CONTEXT_BUILDING_FAILED: 'RAG_CONTEXT_BUILDING_FAILED',
  ANSWER_GENERATION_FAILED: 'RAG_ANSWER_GENERATION_FAILED',
};
```

### 8.2 错误处理

```javascript
try {
  const result = await ragService.retrieve(query);
} catch (error) {
  if (error.code === 'RAG_EMBEDDING_FAILED') {
    // 处理 Embedding 失败
  } else if (error.code === 'RAG_RETRIEVAL_FAILED') {
    // 处理检索失败
  }
}
```

## 九、总结

RAG 模块的核心流程：

1. **文档索引**：Document → Chunk → Embedding → Vector Store
2. **检索**：Query → Embedding → Vector Search → Top K
3. **上下文构建**：Top K → Context
4. **答案生成**：Context + Query → LLM → Answer

关键优化点：
- 缓存 Embedding
- 批量处理
- 异步索引
- 上下文长度控制