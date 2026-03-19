// API服务，处理与后端的通信

import { mockImageReverseResult, mockTextReverseResult, mockVideoReverseResult, mockGenerateResult, mockBillingInfo } from './mock-data';

// 使用相对路径或环境变量配置API地址
// 在Vercel上，前端和后端会在同一个域名下，使用相对路径即可
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// 是否使用模拟数据
const USE_MOCK_DATA = false; // 生产环境应设为false，使用真实API

// 请求配置 - 移除敏感的Authorization头
const requestConfig = {
  headers: {
    'Content-Type': 'application/json',
  },
};

// 模型配置类型定义
interface ModelConfig {
  name: string;
  cost: number;
  quality: number;
  speed: number;
}

interface ModelTypeConfig {
  default: string;
  options: Record<string, ModelConfig>;
}

interface ModelsConfig {
  reverseEngineering: ModelTypeConfig;
  imageGeneration: ModelTypeConfig;
  videoGeneration: ModelTypeConfig;
  textGeneration: ModelTypeConfig;
}

// 模型选择参数
interface ModelSelectionParams {
  budget?: number;
  qualityRequired?: number;
  modelPreference?: string;
}

// 处理API请求的通用函数
const handleApiRequest = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
  // 如果使用模拟数据，直接返回模拟结果
  if (USE_MOCK_DATA) {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 根据URL返回不同的模拟数据
    if (url.includes('/reverse-prompt')) {
      return mockImageReverseResult() as unknown as T;
    } else if (url.includes('/generate')) {
      const prompt = JSON.parse(options.body as string).prompt;
      return mockGenerateResult(prompt, 'image') as unknown as T;
    } else if (url.includes('/billing')) {
      return mockBillingInfo as unknown as T;
    } else if (url.includes('/config')) {
      return { features: { imageGeneration: true, videoGeneration: true, textGeneration: true } } as unknown as T;
    } else if (url.includes('/models')) {
      return {
        reverseEngineering: {
          default: 'deepseek-v4',
          options: {
            'deepseek-v4': {
              name: 'DeepSeek V4',
              cost: 0.05,
              quality: 85,
              speed: 70
            }
          }
        }
      } as unknown as T;
    }
    
    // 默认返回空对象
    return {} as T;
  }

  // 真实API请求 - 调用后端API
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...requestConfig,
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API请求失败: ${response.status}`);
    }

    return response.json() as Promise<T>;
  } catch (error) {
    console.error('API请求错误:', error);
    throw error;
  }
};

// 处理文件上传的通用函数
const handleFileUpload = async <T>(url: string, file: File, type: string, modelParams?: ModelSelectionParams): Promise<T> => {
  // 如果使用模拟数据，直接返回模拟结果
  if (USE_MOCK_DATA) {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 根据类型返回不同的模拟结果
    if (type === 'image') {
      return mockImageReverseResult() as unknown as T;
    } else if (type === 'video') {
      return mockVideoReverseResult() as unknown as T;
    } else {
      return mockTextReverseResult('') as unknown as T;
    }
  }

  // 真实文件上传 - 调用后端API
  try {
    // 将文件转换为base64编码，以便在JSON中传输
    const fileData = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        fileType: type, 
        fileData,
        budget: modelParams?.budget || 0,
        qualityRequired: modelParams?.qualityRequired || 80,
        modelPreference: modelParams?.modelPreference
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `文件上传失败: ${response.status}`);
    }

    return response.json() as Promise<T>;
  } catch (error) {
    console.error('文件上传错误:', error);
    throw error;
  }
};

// 模型服务层 - 实现混合模型策略
const modelService = {
  // 获取可用模型列表
  getModels: async (): Promise<ModelsConfig> => {
    return handleApiRequest<ModelsConfig>('/models');
  },

  // 模型选择策略
  selectModel: async (taskType: keyof ModelsConfig, params?: ModelSelectionParams): Promise<string> => {
    const models = await modelService.getModels();
    const modelType = models[taskType];
    
    // 根据预算和质量要求选择模型
    const suitableModels = Object.entries(modelType.options)
      .filter(([_, config]) => config.quality >= (params?.qualityRequired || 80))
      .sort(([_, a], [__, b]) => {
        // 优先选择成本低，然后质量高，最后速度快
        if (a.cost !== b.cost) return a.cost - b.cost;
        if (a.quality !== b.quality) return b.quality - a.quality;
        return b.speed - a.speed;
      });
    
    // 如果有预算限制，过滤掉超出预算的模型
      if (params?.budget) {
        const affordableModels = suitableModels.filter(([_, config]) => config.cost <= (params.budget || 0));
        return affordableModels.length > 0 ? affordableModels[0][0] : modelType.default;
      }
    
    return suitableModels.length > 0 ? suitableModels[0][0] : modelType.default;
  },

  // 获取模型配置
  getModelConfig: async (taskType: keyof ModelsConfig, modelId: string): Promise<ModelConfig | null> => {
    const models = await modelService.getModels();
    return models[taskType]?.options[modelId] || null;
  }
};

// API服务接口 - 更新为支持多模型
const apiService = {
  // 模型服务
  modelService,

  // 获取配置信息（不包含敏感信息）
  getConfig: async () => {
    return handleApiRequest<{ features: Record<string, boolean>; limits: Record<string, number> }>('/config');
  },

  // 反向工程API - 统一接口
  reverseEngineering: {
    // 通用反向提示词生成API - 支持多模型
    generateReversePrompt: async (file: File, fileType: 'image' | 'video' | 'text', modelParams?: ModelSelectionParams) => {
      return handleFileUpload<{ 
        prompt: string; 
        structuredPrompt: any; 
        confidence: number; 
        params: Record<string, any>; 
        workflow: string[];
        modelInfo: ModelConfig;
      }>('/reverse-prompt', file, fileType, modelParams);
    },
  },

  // 生成API - 支持多模型
  generation: {
    // 基于提示词生成内容
    generateFromPrompt: async (prompt: string, type: 'image' | 'video' | 'text', modelParams?: ModelSelectionParams) => {
      return handleApiRequest<{ 
      id: string; 
      type: 'image' | 'video' | 'text'; 
      content: string; 
      prompt: string;
      modelInfo: ModelConfig;
      cost: number;
    }>('/generate', {
      method: 'POST',
      body: JSON.stringify({ 
        prompt, 
        type,
        budget: modelParams?.budget || 0,
        qualityRequired: modelParams?.qualityRequired || 80,
        modelPreference: modelParams?.modelPreference
      }),
    });
    },
  },

  // 计费API
  billing: {
    // 获取账单信息
    getBillingInfo: async () => {
      return handleApiRequest<{ currentPlan: string; remainingCredits: number; usageHistory: Array<{ date: string; creditsUsed: number }> }>('/billing');
    },
  },
};

export default apiService;
