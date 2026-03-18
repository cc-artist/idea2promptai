import { GenerateResult } from '../types';
import { cacheService } from './cache';
import apiService from './api';

// 基于反推结果生成新内容
export const generateFromReverseResult = async (
  prompt: string,
  type: 'image' | 'text',
  params?: Record<string, any>
): Promise<GenerateResult> => {
  try {
    // 检查缓存
    const cachedResult = cacheService.getGenerateResult(prompt, type, params || {});
    if (cachedResult) {
      return cachedResult;
    }

    // 调用统一的生成API
    const result = await apiService.generation.generateFromPrompt(prompt, type, params);
    
    // 将结果转换为GenerateResult类型，限制type为'image'或'text'
    const typedResult = {
      ...result,
      type: result.type as 'image' | 'text'
    };
    
    // 缓存结果
    cacheService.cacheGenerateResult(prompt, type, params || {}, typedResult);
    
    return typedResult;
  } catch (error) {
    console.error('生成失败:', error);
    throw new Error('生成失败，请重试');
  }
};
