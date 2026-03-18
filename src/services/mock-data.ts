// 模拟数据服务，用于在没有后端的情况下提供测试数据

import { ReversePromptResult } from '../types';

// 生成随机置信度
const generateRandomConfidence = (): number => {
  return Math.floor(Math.random() * 30) + 65; // 65-95之间的随机数
};

// 模拟图像反推结果
export const mockImageReverseResult = (): ReversePromptResult => {
  const confidence = generateRandomConfidence();
  return {
    prompt: 'A beautiful landscape with mountains and rivers, realistic style, 8k resolution',
    structuredPrompt: {
      elements: {
        mainSubject: 'landscape',
        style: 'realistic',
        sceneAction: 'mountains and rivers',
        artistReference: '',
        details: '8k resolution',
        positivePrompt: ['beautiful', 'landscape', 'mountains', 'rivers', 'realistic style', '8k resolution'],
        negativePrompt: ['blurry', 'low quality', 'cartoon']
      },
      confidence: confidence,
      applicationStructure: 'photography',
      paradigmContents: {
        basicStructure: {
          singleWord: 'landscape',
          phrase: 'beautiful landscape',
          completeSentence: 'A beautiful landscape with mountains and rivers'
        },
        functionalElements: {
          mainSubject: 'landscape',
          style: 'realistic',
          sceneAction: 'mountains and rivers',
          artistReference: '',
          details: '8k resolution',
          positivePrompt: ['beautiful', 'landscape', 'mountains', 'rivers', 'realistic style', '8k resolution'],
          negativePrompt: ['blurry', 'low quality', 'cartoon']
        },
        applicationStructures: {
          photography: 'photography style',
          painting: 'painting style'
        }
      }
    },
    confidence: confidence,
    params: {
      model: 'midjourney v5',
      steps: 50,
      cfg_scale: 7,
      aspect_ratio: '16:9',
      style: 'realistic'
    },
    workflow: [
      '图像特征提取',
      '风格识别',
      '提示词生成',
      '参数优化'
    ]
  };
};

// 模拟文案反推结果
export const mockTextReverseResult = (text: string): ReversePromptResult => {
  const confidence = generateRandomConfidence();
  
  // 根据文本内容生成不同的提示词
  let basePrompt = '';
  if (text.includes('科技') || text.includes('技术')) {
    basePrompt = 'A technical article about technology, professional tone, clear structure';
  } else if (text.includes('产品') || text.includes('营销')) {
    basePrompt = 'A product marketing copy, persuasive tone, highlight product benefits';
  } else if (text.includes('故事') || text.includes('小说')) {
    basePrompt = 'A narrative story, engaging plot, vivid characters';
  } else {
    basePrompt = 'A well-written article, clear and concise, good structure';
  }
  
  return {
    prompt: basePrompt,
    structuredPrompt: {
      elements: {
        mainSubject: 'article',
        style: 'professional',
        sceneAction: 'writing',
        artistReference: '',
        details: 'clear structure',
        positivePrompt: ['well-written', 'clear', 'concise', 'good structure'],
        negativePrompt: ['poor grammar', 'unclear', 'redundant']
      },
      confidence: confidence,
      applicationStructure: 'text',
      paradigmContents: {
        basicStructure: {
          singleWord: 'article',
          phrase: 'well-written article',
          completeSentence: 'A well-written article with clear structure'
        },
        functionalElements: {
          mainSubject: 'article',
          style: 'professional',
          sceneAction: 'writing',
          artistReference: '',
          details: 'clear structure',
          positivePrompt: ['well-written', 'clear', 'concise', 'good structure'],
          negativePrompt: ['poor grammar', 'unclear', 'redundant']
        },
        applicationStructures: {
          text: 'text style'
        }
      }
    },
    confidence: confidence,
    params: {
      model: 'gpt-4',
      temperature: 0.7,
      max_tokens: 500,
      top_p: 0.9
    },
    workflow: [
      '文本语义分析',
      '关键词提取',
      '风格识别',
      '提示词生成'
    ]
  };
};

// 模拟视频反推结果
export const mockVideoReverseResult = (): ReversePromptResult => {
  const confidence = generateRandomConfidence();
  return {
    prompt: 'A cinematic video of a city skyline at night, smooth camera movement, vibrant colors, 4k resolution',
    structuredPrompt: {
      elements: {
        mainSubject: 'city skyline',
        style: 'cinematic',
        sceneAction: 'night view',
        artistReference: '',
        details: 'smooth camera movement, vibrant colors, 4k resolution',
        positivePrompt: ['cinematic', 'city skyline', 'night', 'smooth camera movement', 'vibrant colors', '4k resolution'],
        negativePrompt: ['shaky footage', 'low resolution', 'poor lighting']
      },
      confidence: confidence,
      applicationStructure: 'video',
      paradigmContents: {
        basicStructure: {
          singleWord: 'video',
          phrase: 'cinematic video',
          completeSentence: 'A cinematic video of a city skyline at night'
        },
        functionalElements: {
          mainSubject: 'city skyline',
          style: 'cinematic',
          sceneAction: 'night view',
          artistReference: '',
          details: 'smooth camera movement, vibrant colors, 4k resolution',
          positivePrompt: ['cinematic', 'city skyline', 'night', 'smooth camera movement', 'vibrant colors', '4k resolution'],
          negativePrompt: ['shaky footage', 'low resolution', 'poor lighting']
        },
        applicationStructures: {
          film: 'film style',
          video: 'video style'
        }
      }
    },
    confidence: confidence,
    params: {
      model: 'runway ml',
      fps: 30,
      resolution: '3840x2160',
      style: 'cinematic'
    },
    workflow: [
      '关键帧采样',
      '视频特征提取',
      '动态分析',
      '提示词生成'
    ]
  };
};

// 模拟生成结果
export const mockGenerateResult = (prompt: string, type: 'image' | 'text') => {
  if (type === 'image') {
    return {
      id: Date.now().toString(),
      type: 'image',
      content: 'https://picsum.photos/800/450',
      prompt: prompt
    };
  } else {
    return {
      id: Date.now().toString(),
      type: 'text',
      content: `This is a generated text based on the prompt: "${prompt}". It demonstrates how the AI can create new content using the reverse-engineered prompt.`,
      prompt: prompt
    };
  }
};

// 模拟计费信息
export const mockBillingInfo = {
  plan: 'FREE',
  monthlyUsageLimit: 10,
  totalUsed: 3,
  imageUsed: 2,
  videoUsed: 1,
  textUsed: 0,
  resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
};

// 模拟用户记录
export const mockUserRecords = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    type: 'image' as const,
    contentUrl: 'https://picsum.photos/200/200?random=1',
    reversePrompt: 'A beautiful landscape with mountains and rivers',
    confidence: 85
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    type: 'text' as const,
    contentUrl: '技术文章内容',
    reversePrompt: 'A technical article about technology',
    confidence: 78
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
    type: 'video' as const,
    contentUrl: '视频内容',
    reversePrompt: 'A cinematic video of a city skyline',
    confidence: 72
  }
];