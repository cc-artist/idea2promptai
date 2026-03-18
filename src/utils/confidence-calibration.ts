// 置信度校准工具，用于提高反向工程结果的可信度

// 置信度校准配置
interface CalibrationConfig {
  baseConfidence: number;
  featureScore: number;
  modality: 'image' | 'text' | 'video';
  additionalFactors?: Record<string, number>;
}

// 置信度校准函数
export const calibrateConfidence = (config: CalibrationConfig): number => {
  const { baseConfidence, featureScore, modality, additionalFactors = {} } = config;
  
  let calibratedConfidence = baseConfidence;
  
  // 1. 基础校准：确保置信度在合理范围内
  calibratedConfidence = Math.max(0, Math.min(100, calibratedConfidence));
  
  // 2. 模态特定校准
  switch (modality) {
    case 'image':
      calibratedConfidence = calibrateImageConfidence(calibratedConfidence, featureScore, additionalFactors);
      break;
    case 'text':
      calibratedConfidence = calibrateTextConfidence(calibratedConfidence, featureScore, additionalFactors);
      break;
    case 'video':
      calibratedConfidence = calibrateVideoConfidence(calibratedConfidence, featureScore, additionalFactors);
      break;
  }
  
  // 3. 应用额外因素校准
  for (const [factor, weight] of Object.entries(additionalFactors)) {
    calibratedConfidence = applyFactorCalibration(calibratedConfidence, factor, weight);
  }
  
  // 4. 最终范围限制
  return Math.max(0, Math.min(100, calibratedConfidence));
};

// 图像模态置信度校准
const calibrateImageConfidence = (baseConfidence: number, featureScore: number, factors: Record<string, number>): number => {
  let calibrated = baseConfidence;
  
  // 特征质量影响
  calibrated += featureScore * 0.15;
  
  // 分辨率影响（如果提供）
  if (factors.resolution) {
    calibrated += factors.resolution * 0.1;
  }
  
  // 对比度影响（如果提供）
  if (factors.contrast) {
    calibrated += factors.contrast * 0.08;
  }
  
  return calibrated;
};

// 文案模态置信度校准
const calibrateTextConfidence = (baseConfidence: number, featureScore: number, factors: Record<string, number>): number => {
  let calibrated = baseConfidence;
  
  // 文本特征丰富度影响
  calibrated += featureScore * 0.18;
  
  // 关键词数量影响（如果提供）
  if (factors.keywordCount) {
    calibrated += Math.min(factors.keywordCount * 2, 15); // 最多增加15分
  }
  
  // 句子结构复杂度影响（如果提供）
  if (factors.sentenceComplexity) {
    calibrated += factors.sentenceComplexity * 0.1;
  }
  
  return calibrated;
};

// 视频模态置信度校准
const calibrateVideoConfidence = (baseConfidence: number, featureScore: number, factors: Record<string, number>): number => {
  let calibrated = baseConfidence;
  
  // 视频特征丰富度影响
  calibrated += featureScore * 0.12;
  
  // 关键帧数量影响（如果提供）
  if (factors.keyframeCount) {
    calibrated += Math.min(factors.keyframeCount * 3, 12); // 最多增加12分
  }
  
  // 视频长度影响（如果提供）
  if (factors.videoLength) {
    calibrated += factors.videoLength * 0.05;
  }
  
  return calibrated;
};

// 应用特定因素校准
const applyFactorCalibration = (confidence: number, factor: string, weight: number): number => {
  let calibrated = confidence;
  
  switch (factor) {
    case 'highResolution':
      calibrated += weight * 10;
      break;
    case 'clearFeatures':
      calibrated += weight * 8;
      break;
    case 'richContext':
      calibrated += weight * 6;
      break;
    case 'complexContent':
      calibrated += weight * 5;
      break;
    case 'ambiguousContent':
      calibrated -= weight * 10;
      break;
    case 'lowQualityInput':
      calibrated -= weight * 15;
      break;
    default:
      // 未知因素，应用默认权重
      calibrated += weight * 3;
  }
  
  return calibrated;
};

// 置信度分类
export const classifyConfidence = (confidence: number): 'high' | 'medium' | 'low' => {
  if (confidence >= 80) return 'high';
  if (confidence >= 60) return 'medium';
  return 'low';
};

// 获取置信度颜色
export const getConfidenceColor = (confidence: number): string => {
  const category = classifyConfidence(confidence);
  switch (category) {
    case 'high':
      return '#10b981'; // 绿色
    case 'medium':
      return '#f59e0b'; // 黄色
    case 'low':
      return '#ef4444'; // 红色
  }
};

// 置信度验证
export const validateConfidence = (confidence: number, threshold: number = 60): boolean => {
  return confidence >= threshold;
};

// 自适应置信度调整（基于历史数据）
export const adaptiveConfidenceAdjustment = (
  currentConfidence: number,
  historicalAccuracy: number,
  modality: 'image' | 'text' | 'video'
): number => {
  // 历史准确率对当前置信度的影响
  const accuracyImpact = (historicalAccuracy - 50) * 0.5;
  
  let adjustedConfidence = currentConfidence + accuracyImpact;
  
  // 模态特定调整
  switch (modality) {
    case 'image':
      adjustedConfidence = Math.min(100, adjustedConfidence + 5); // 图像模态通常更可靠
      break;
    case 'video':
      adjustedConfidence = Math.max(0, adjustedConfidence - 5); // 视频模态通常更复杂，降低置信度
      break;
    case 'text':
      // 文本模态保持中立
      break;
  }
  
  return Math.max(0, Math.min(100, adjustedConfidence));
};