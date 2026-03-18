// 基本构成范式类型
export interface BasicStructureParadigm {
  singleWord: string; // 单个词语
  phrase: string; // 短语
  completeSentence: string; // 完整句子
}

// 应用结构范式类型
export interface ApplicationStructuresParadigm {
  [key: string]: string; // 键为类型（如photography, painting, film, text），值为结构字符串
}

// 结构化提示词要素类型
export interface StructuredPromptElements {
  // 功能要素
  mainSubject: string; // 主体
  style: string; // 风格
  sceneAction: string; // 场景/动作
  artistReference?: string; // 艺术家/参考
  details: string; // 细节修饰
  positivePrompt: string[]; // 正向提示词
  negativePrompt: string[]; // 反向提示词
}

// 范式维度内容类型
export interface ParadigmContents {
  basicStructure: BasicStructureParadigm; // 基本构成范式
  functionalElements: StructuredPromptElements; // 功能要素范式
  applicationStructures: ApplicationStructuresParadigm; // 应用结构范式
}

// 提示词结构类型
export interface PromptStructure {
  elements: StructuredPromptElements;
  applicationStructure: string; // 应用结构范式
  confidence: number; // 置信度
  paradigmContents?: ParadigmContents; // 所有范式维度内容
}

// 反向工程结果类型
export interface ReversePromptResult {
  prompt: string; // 生成的提示词
  structuredPrompt: PromptStructure; // 结构化提示词
  confidence: number;
  params?: Record<string, any>;
  workflow?: string[];
}

export interface UploadedItem {
  id: string;
  type: 'image' | 'video' | 'text';
  content: string;
  confidence: number;
  prompt: string;
  structuredPrompt: PromptStructure;
  params?: Record<string, any>;
  workflow?: string[];
}

export interface GenerateResult {
  id: string;
  type: 'image' | 'text';
  content: string;
  prompt: string;
}

export interface UserRecord {
  id: string;
  timestamp: Date;
  type: 'image' | 'video' | 'text';
  contentUrl: string;
  reversePrompt: string;
  structuredPrompt: PromptStructure;
  confidence: number;
}
