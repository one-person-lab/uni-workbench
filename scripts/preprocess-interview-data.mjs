// AI面试知识数据预处理脚本（Node.js环境）

import { readFileSync, readdirSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const aiInterviewGuidePath = join(__dirname, '..', 'ai-interview-guide');
const careerOsPath = join(__dirname, '..', 'career');
const outputPath = join(__dirname, '..', 'workbench', 'src', 'data');

console.log('开始预处理AI面试知识数据...');

/**
 * 知识来源枚举
 */
const KnowledgeSource = {
  PUBLIC: 'PUBLIC',
  PERSONAL: 'PERSONAL',
  GENERATED: 'GENERATED',
};

/**
 * 分类映射
 */
const categoryMap = {
  '01-basic-concepts': 'llm',
  '02-prompt-engineering': 'prompt_engineering',
  '03-rag-system': 'rag',
  '04-transformer-architecture': 'transformer',
  '05-ai-agent-basics': 'agent',
  '06-vector-index-optimization': 'vector_database',
  '07-model-training': 'fine_tuning',
  '08-inference-optimization': 'inference',
  '09-ai-safety-evaluation': 'evaluation',
  '10-production-deployment': 'deployment',
  '11-multimodal-ai': 'ai_application_architecture',
  '12-frameworks-tools': 'ai_engineering',
  '13-multi-agent-systems': 'agent',
  '14-mcp-skill-systems': 'mcp',
  '15-advanced-topics': 'ai_system_design',
  '16-resume-interview-tips': 'ai_engineering',
  '17-ai-coding-tools': 'ai_coding',
  '18-big-tech-interview-questions': 'ai_engineering',
  '19-inference-frameworks': 'inference',
  '20-rag-advanced-optimization': 'rag',
  '21-multimodal-agents': 'agent',
  '22-agent-planning-reflection': 'agent',
  '23-agent-observability': 'agent',
  '24-python-engineering': 'python',
  '25-system-design-ai': 'ai_system_design',
  '26-forward-deployed-engineer': 'ai_engineering',
  '27-project-experience': 'ai_engineering',
  '28-test-harness-evaluation': 'evaluation',
};

/**
 * 生成唯一ID
 */
function generateId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 解析ai-interview-guide内容
 */
function parseAiInterviewGuideContent(content, category) {
  const knowledge = [];
  const questions = [];
  
  // 提取难度
  const difficultyMatch = content.match(/难度：\s*([⭐]+)/);
  const difficulty = difficultyMatch ? difficultyMatch[1].length : 3;
  
  // 提取考点
  const examPointMatch = content.match(/考点：\s*(.+)/);
  const examPoint = examPointMatch ? examPointMatch[1].trim() : '';
  
  // 提取所有问题块
  const questionBlocks = content.split(/###\s+Q\d+:/);
  
  questionBlocks.forEach((block, index) => {
    if (index === 0) return; // 跳过第一个块（标题）
    
    const questionMatch = block.match(/^([^\n]+)/);
    const questionTitle = questionMatch ? questionMatch[1].trim() : '';
    
    // 提取答案
    const answerMatch = block.match(/<details>[\s\S]*?<summary>[\s\S]*?<\/summary>[\s\S]*?<\/details>/);
    const answerContent = answerMatch ? answerMatch[0] : block;
    
    // 提取标签
    const tags = [];
    if (examPoint) {
      const keywords = examPoint.split(/[、，,]/);
      tags.push(...keywords.map(k => k.trim()).filter(k => k));
    }
    
    // 创建知识
    const knowledgeItem = {
      id: generateId('knowledge'),
      title: questionTitle,
      content: answerContent,
      category: categoryMap[category] || 'ai_engineering',
      subcategory: examPoint,
      difficulty: difficulty,
      frequency: 3,
      tags: tags,
      source: KnowledgeSource.PUBLIC,
      sourceRepository: 'ai-interview-guide',
      sourcePath: category,
      relatedSkills: [],
      relatedProjects: [],
      relatedQuestions: [],
      relatedKnowledge: [],
      personalAnswerIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    knowledge.push(knowledgeItem);
    
    // 创建面试题
    const questionId = generateId('question');
    const questionItem = {
      id: questionId,
      title: questionTitle,
      content: questionTitle,
      category: categoryMap[category] || 'ai_engineering',
      difficulty: difficulty,
      frequency: 3,
      relatedKnowledge: [knowledgeItem.id],
      relatedProjects: [],
      followUpQuestions: [],
      source: KnowledgeSource.PUBLIC,
      priority: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    questions.push(questionItem);
    
    // 关联面试题到知识
    knowledgeItem.relatedQuestions.push(questionId);
  });
  
  return { knowledge, questions };
}

/**
 * 导入ai-interview-guide
 */
function importAiInterviewGuide() {
  const knowledge = [];
  const questions = [];
  
  const docsPath = join(aiInterviewGuidePath, 'docs');
  
  try {
    const categories = readdirSync(docsPath);
    
    for (const category of categories) {
      const categoryPath = join(docsPath, category);
      const readmePath = join(categoryPath, 'README.md');
      
      try {
        const content = readFileSync(readmePath, 'utf-8');
        const parsed = parseAiInterviewGuideContent(content, category);
        
        knowledge.push(...parsed.knowledge);
        questions.push(...parsed.questions);
        
        console.log(`已处理: ${category}`);
      } catch (error) {
        console.warn(`无法读取 ${readmePath}:`, error.message);
      }
    }
  } catch (error) {
    console.error('读取ai-interview-guide失败:', error.message);
  }
  
  return { knowledge, questions };
}

/**
 * 解析career项目
 */
function parseCareerOsProject(content, filename, category) {
  const projectName = filename.replace('.md', '');
  
  // 提取技术栈
  const technologies = [];
  const techKeywords = ['Java', 'Go', 'Python', 'Spring', 'Vue', 'React', 'MySQL', 'Redis', 'MQ', 'RocketMQ', 'Kafka', 'Docker', 'K8s', 'AI', 'RAG', 'Agent', 'LangChain', 'GPT', 'YOLO', 'MQTT', 'WebSocket'];
  
  techKeywords.forEach(tech => {
    if (content.includes(tech)) {
      technologies.push(tech);
    }
  });
  
  // 提取描述
  const descriptionMatch = content.match(/##\s+面试官.*?\n([\s\S]*?)(?=##|$)/);
  const description = descriptionMatch ? descriptionMatch[1].trim() : content.substring(0, 200);
  
  return {
    id: generateId('project'),
    name: projectName,
    description: description,
    role: '后端开发/架构设计',
    technologies: technologies,
    achievements: [],
    source: 'PERSONAL',
    relatedKnowledge: [],
    relatedQuestions: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * 导入career项目
 */
function importCareerOsProjects() {
  const projects = [];
  
  const projectsPath = join(careerOsPath, '03-面试', '01-面试准备', '项目案例');
  
  try {
    const categories = readdirSync(projectsPath);
    
    for (const category of categories) {
      const categoryPath = join(projectsPath, category);
      
      try {
        const files = readdirSync(categoryPath);
        
        for (const file of files) {
          if (file.endsWith('.md')) {
            const filePath = join(categoryPath, file);
            const content = readFileSync(filePath, 'utf-8');
            const project = parseCareerOsProject(content, file, category);
            
            if (project) {
              projects.push(project);
              console.log(`已处理项目: ${file}`);
            }
          }
        }
      } catch (error) {
        console.warn(`无法读取 ${categoryPath}:`, error.message);
      }
    }
  } catch (error) {
    console.warn('无法读取项目案例目录:', error.message);
  }
  
  return projects;
}

/**
 * 建立知识-项目关联
 */
function establishKnowledgeProjectRelations(knowledge, projects) {
  knowledge.forEach(knowledgeItem => {
    projects.forEach(project => {
      let matchScore = 0;
      
      // 标签匹配
      knowledgeItem.tags.forEach(tag => {
        if (project.technologies.includes(tag)) {
          matchScore += 0.3;
        }
      });
      
      // 分类匹配
      if (knowledgeItem.category === 'rag' && project.technologies.includes('RAG')) {
        matchScore += 0.4;
      }
      if (knowledgeItem.category === 'agent' && project.technologies.includes('Agent')) {
        matchScore += 0.4;
      }
      
      if (matchScore > 0.5) {
        knowledgeItem.relatedProjects.push(project.id);
        project.relatedKnowledge.push(knowledgeItem.id);
      }
    });
  });
}

/**
 * 主函数
 */
function main() {
  console.log('导入ai-interview-guide...');
  const { knowledge, questions } = importAiInterviewGuide();
  
  console.log('导入career项目...');
  const projects = importCareerOsProjects();
  
  console.log('建立关联关系...');
  establishKnowledgeProjectRelations(knowledge, projects);
  
  const data = {
    knowledge,
    questions,
    projects,
    personalAnswers: [],
    jobPositions: [],
    jobKnowledgeMatches: [],
    jobQuestionMatches: [],
    generatedAt: new Date().toISOString(),
  };
  
  // 保存到JSON文件
  const outputPathJson = join(outputPath, 'interview-knowledge.json');
  const dataStr = JSON.stringify(data, null, 2);
  
  // 确保输出目录存在
  mkdirSync(outputPath, { recursive: true });
  
  writeFileSync(outputPathJson, dataStr);
  
  console.log('数据预处理完成！');
  console.log(`- 知识条目: ${knowledge.length}`);
  console.log(`- 面试题: ${questions.length}`);
  console.log(`- 项目: ${projects.length}`);
  console.log(`- 输出文件: ${outputPathJson}`);
}

main();