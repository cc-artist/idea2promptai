import { ReversePromptResult } from '../types';
import { cacheService } from './cache';
import apiService from './api';
import { enhanceImageFeatures, optimizeImagePrompt } from '../utils/image-optimization';
import { enhanceTextFeatures, optimizeTextPrompt } from '../utils/text-optimization';
import { enhanceVideoFeatures, sampleKeyframes, optimizeVideoPrompt } from '../utils/video-optimization';
import { calibrateConfidence } from '../utils/confidence-calibration';

// 图像→提示词反推
export const reverseImageToPrompt = async (file: File): Promise<ReversePromptResult> => {
  try {
    // 检查缓存
    const contentHash = cacheService.computeContentHash(file);
    const cachedResult = cacheService.getReverseResult('image', contentHash);
    if (cachedResult) {
      return cachedResult;
    }

    // 1. 图像特征增强
    const enhancedFeatures = await enhanceImageFeatures(file);
    
    // 2. 调用真实API获取基础结果
    const baseResult = await apiService.reverseEngineering.generateReversePrompt(file, 'image');
    
    // 3. 优化提示词
    const optimizedPrompt = optimizeImagePrompt(baseResult.prompt, enhancedFeatures);
    
    // 4. 置信度校准（基于特征质量调整置信度）
    const featureScore = Object.keys(enhancedFeatures).length * 2; // 计算特征分数
    let calibratedConfidence = calibrateConfidence({
      baseConfidence: baseResult.confidence,
      featureScore: featureScore,
      modality: 'image',
      additionalFactors: {
        resolution: enhancedFeatures.dimensions && (enhancedFeatures.dimensions.width >= 1920 || enhancedFeatures.dimensions.height >= 1080) ? 10 : 
                    enhancedFeatures.dimensions && (enhancedFeatures.dimensions.width >= 1280 || enhancedFeatures.dimensions.height >= 720) ? 5 : 0,
        contrast: enhancedFeatures.hasStrongEdges ? 8 : 0
      }
    });
    
    // 5. 构建最终结果
    const finalResult: ReversePromptResult = {
      ...baseResult,
      prompt: optimizedPrompt,
      confidence: calibratedConfidence,
      params: {
        ...baseResult.params,
        enhancedFeatures: enhancedFeatures
      }
    };
    
    // 缓存结果
    cacheService.cacheReverseResult('image', contentHash, finalResult);
    
    return finalResult;
  } catch (error) {
    console.error('图像反推失败:', error);
    throw new Error('图像反推失败');
  }
};

// 文案→提示词反推
export const reverseTextToPrompt = async (text: string): Promise<ReversePromptResult> => {
  try {
    // 检查缓存
    const contentHash = cacheService.computeContentHash(text);
    const cachedResult = cacheService.getReverseResult('text', contentHash);
    if (cachedResult) {
      return cachedResult;
    }

    // 1. 文案特征增强
    const enhancedFeatures = await enhanceTextFeatures(text);
    
    // 2. 调用真实API获取基础结果
    // 创建一个临时文本文件用于API调用
    const tempFile = new File([text], 'temp.txt', { type: 'text/plain' });
    const baseResult = await apiService.reverseEngineering.generateReversePrompt(tempFile, 'text');
    
    // 3. 优化提示词
    const optimizedPrompt = optimizeTextPrompt(baseResult.prompt, enhancedFeatures);
    
    // 4. 置信度校准（基于文本特征质量调整置信度）
    const featureScore = (enhancedFeatures.keywords?.length || 0) + (enhancedFeatures.sentenceCount || 0);
    let calibratedConfidence = calibrateConfidence({
      baseConfidence: baseResult.confidence,
      featureScore: featureScore,
      modality: 'text',
      additionalFactors: {
        keywordCount: enhancedFeatures.keywords?.length || 0,
        sentenceComplexity: enhancedFeatures.averageSentenceLength || 0
      }
    });
    
    // 5. 构建最终结果
    const finalResult: ReversePromptResult = {
      ...baseResult,
      prompt: optimizedPrompt,
      confidence: calibratedConfidence,
      params: {
        ...baseResult.params,
        enhancedFeatures: enhancedFeatures
      }
    };
    
    // 缓存结果
    cacheService.cacheReverseResult('text', contentHash, finalResult);
    
    return finalResult;
  } catch (error) {
    console.error('文案反推失败:', error);
    throw new Error('文案反推失败');
  }
};

// 视频→提示词反推
export const reverseVideoToPrompt = async (file: File): Promise<ReversePromptResult> => {
  try {
    // 检查缓存
    const contentHash = cacheService.computeContentHash(file);
    const cachedResult = cacheService.getReverseResult('video', contentHash);
    if (cachedResult) {
      return cachedResult;
    }

    // 1. 视频特征增强
    const enhancedFeatures = await enhanceVideoFeatures(file);
    
    // 2. 智能关键帧采样（添加超时处理）
    let keyframes: string[] = [];
    try {
      keyframes = await sampleKeyframes(file, 3); // 采样3个关键帧
    } catch (error) {
      console.warn('关键帧采样失败，将继续处理:', error);
      // 关键帧采样失败不影响后续处理
    }
    
    // 3. 调用真实API获取基础结果
    const baseResult = await apiService.reverseEngineering.generateReversePrompt(file, 'video');
    
    // 4. 优化提示词
    const optimizedPrompt = optimizeVideoPrompt(baseResult.prompt, enhancedFeatures, keyframes);
    
    // 5. 置信度校准（基于视频特征和关键帧质量调整置信度）
    const featureScore = Object.keys(enhancedFeatures).length * 2 + keyframes.length * 3;
    let calibratedConfidence = calibrateConfidence({
      baseConfidence: baseResult.confidence,
      featureScore: featureScore,
      modality: 'video',
      additionalFactors: {
        keyframeCount: keyframes.length,
        videoLength: enhancedFeatures.lengthCategory === 'medium' ? 5 : 
                     enhancedFeatures.lengthCategory === 'long' ? 3 : 0,
        resolution: enhancedFeatures.resolutionCategory === '4k' || enhancedFeatures.resolutionCategory === 'fullhd' ? 10 : 
                    enhancedFeatures.resolutionCategory === 'hd' ? 5 : 0
      }
    });
    
    // 6. 构建最终结果
    const finalResult: ReversePromptResult = {
      ...baseResult,
      prompt: optimizedPrompt,
      confidence: calibratedConfidence,
      params: {
        ...baseResult.params,
        enhancedFeatures: enhancedFeatures,
        keyframeCount: keyframes.length,
        videoFormat: file.type // 添加视频格式信息
      }
    };
    
    // 缓存结果
    cacheService.cacheReverseResult('video', contentHash, finalResult);
    
    return finalResult;
  } catch (error) {
    console.error('视频反推失败:', error);
    // 提供更详细的错误信息
    const fileType = file.type;
    throw new Error(`视频反推失败 (格式: ${fileType})。请确保视频格式受支持，如MP4、WebM等。`);
  }
};
