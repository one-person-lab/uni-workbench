// 资产类型定义
export const AssetType = {
  KNOWLEDGE: 'knowledge',
  SKILL: 'skill',
  PROMPT: 'prompt',
  WORKFLOW: 'workflow',
  TEMPLATE: 'template',
  TUTORIAL: 'tutorial',
  CASE: 'case',
  PROJECT: 'project',
  AGENT: 'agent',
  TOOL: 'tool',
};

export const AssetStatus = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
};

export const ProductStatus = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
};

export const PricingType = {
  ONE_TIME: 'one-time',
  SUBSCRIPTION: 'subscription',
  FREE: 'free',
};

/**
 * Asset 基础接口
 * 所有资产的基础抽象单元
 */
export const createAsset = (data) => ({
  id: data.id || `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  type: data.type,
  title: data.title,
  description: data.description || '',
  content: data.content || {},
  tags: data.tags || [],
  author: data.author || 'anonymous',
  status: data.status || AssetStatus.DRAFT,
  version: data.version || '1.0.0',
  createdAt: data.createdAt || new Date().toISOString(),
  updatedAt: data.updatedAt || new Date().toISOString(),
  metadata: data.metadata || {},
  relatedAssets: data.relatedAssets || [],
});

/**
 * Skill 专用创建函数
 */
export const createSkill = (data) => createAsset({
  type: AssetType.SKILL,
  ...data,
  content: {
    level: data.level || 50,
    category: data.category || 'general',
    prerequisites: data.prerequisites || [],
    learningPath: data.learningPath || [],
    assessmentMethod: data.assessmentMethod || 'self-assessment',
    projectIds: data.projectIds || [],
    ...data.content,
  },
});

/**
 * Prompt 专用创建函数
 */
export const createPrompt = (data) => createAsset({
  type: AssetType.PROMPT,
  ...data,
  content: {
    template: data.template || '',
    variables: data.variables || [],
    targetModel: data.targetModel || 'gpt-4',
    examples: data.examples || [],
    ...data.content,
  },
});

/**
 * Workflow 专用创建函数
 */
export const createWorkflow = (data) => createAsset({
  type: AssetType.WORKFLOW,
  ...data,
  content: {
    steps: data.steps || [],
    inputs: data.inputs || {},
    outputs: data.outputs || {},
    requiredAssets: data.requiredAssets || [],
    ...data.content,
  },
});

/**
 * Template 专用创建函数
 */
export const createTemplate = (data) => createAsset({
  type: AssetType.TEMPLATE,
  ...data,
  content: {
    structure: data.structure || {},
    placeholders: data.placeholders || [],
    examples: data.examples || [],
    ...data.content,
  },
});

/**
 * Tutorial 专用创建函数
 */
export const createTutorial = (data) => createAsset({
  type: AssetType.TUTORIAL,
  ...data,
  content: {
    chapters: data.chapters || [],
    duration: data.duration || 0,
    difficulty: data.difficulty || 'beginner',
    prerequisites: data.prerequisites || [],
    ...data.content,
  },
});

/**
 * Case 专用创建函数
 */
export const createCase = (data) => createAsset({
  type: AssetType.CASE,
  ...data,
  content: {
    context: data.context || '',
    problem: data.problem || '',
    solution: data.solution || '',
    result: data.result || '',
    lessons: data.lessons || [],
    usedAssets: data.usedAssets || [],
    ...data.content,
  },
});

/**
 * Product 创建函数
 */
export const createProduct = (data) => ({
  id: data.id || `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  title: data.title,
  description: data.description || '',
  author: data.author || 'anonymous',
  authorProfile: {
    name: data.authorProfile?.name || '',
    avatar: data.authorProfile?.avatar || '',
    bio: data.authorProfile?.bio || '',
    socials: data.authorProfile?.socials || {},
  },
  status: data.status || ProductStatus.DRAFT,
  pricing: {
    type: data.pricing?.type || PricingType.FREE,
    amount: data.pricing?.amount,
    currency: data.pricing?.currency || 'CNY',
  },
  assets: data.assets || [],
  version: data.version || '1.0.0',
  createdAt: data.createdAt || new Date().toISOString(),
  updatedAt: data.updatedAt || new Date().toISOString(),
  publishedAt: data.publishedAt,
  statistics: {
    views: data.statistics?.views || 0,
    sales: data.statistics?.sales || 0,
    rating: data.statistics?.rating || 0,
  },
});

/**
 * AuthorProfile 创建函数
 */
export const createAuthorProfile = (data) => ({
  id: data.id || `author_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  name: data.name,
  avatar: data.avatar || '',
  bio: data.bio || '',
  tagline: data.tagline || '',
  socials: {
    wechat: data.socials?.wechat,
    email: data.socials?.email,
    github: data.socials?.github,
    twitter: data.socials?.twitter,
    website: data.socials?.website,
  },
  expertise: data.expertise || [],
  verified: data.verified || false,
  createdAt: data.createdAt || new Date().toISOString(),
});