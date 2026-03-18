// 视频优化工具，用于增强反向工程的精准度

// 视频特征提取与增强
export const enhanceVideoFeatures = async (file: File): Promise<Record<string, any>> => {
  return new Promise((resolve) => {
    // 创建视频元素加载文件
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    video.onloadedmetadata = () => {
      // 提取视频基本特征
      const features = {
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
        aspectRatio: video.videoWidth / video.videoHeight,
        // 估算帧率（简化版）
        estimatedFps: estimateFps(video),
        // 视频类型分析
        videoType: analyzeVideoType(file.name),
        // 视频长度分类
        lengthCategory: categorizeVideoLength(video.duration),
        // 分辨率分类
        resolutionCategory: categorizeResolution(video.videoWidth, video.videoHeight)
      };
      
      resolve(features);
    };
    
    video.onerror = () => {
      // 视频加载失败，返回基本特征
      resolve({
        duration: 0,
        width: 0,
        height: 0,
        aspectRatio: 16/9, // 默认宽高比
        estimatedFps: 30,
        videoType: 'unknown',
        lengthCategory: 'short',
        resolutionCategory: 'sd'
      });
    };
    
    video.src = URL.createObjectURL(file);
  });
};

// 智能关键帧采样
export const sampleKeyframes = async (file: File, sampleCount: number = 5): Promise<string[]> => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    // 添加canplaythrough事件，确保视频可以正常播放
    video.oncanplaythrough = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(video.src);
        resolve([]);
        return;
      }
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const keyframes: string[] = [];
      const duration = video.duration;
      
      // 基于时间均匀采样关键帧
      const sampleIntervals = duration / sampleCount;
      
      let samplesTaken = 0;
      
      const captureFrame = (time: number) => {
        video.currentTime = time;
      };
      
      video.onseeked = () => {
        // 绘制当前帧到画布
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // 将画布内容转换为Base64编码的图像
        const frameData = canvas.toDataURL('image/jpeg', 0.8);
        keyframes.push(frameData);
        
        samplesTaken++;
        
        if (samplesTaken < sampleCount) {
          // 继续采样下一帧
          captureFrame(samplesTaken * sampleIntervals);
        } else {
          // 采样完成
          URL.revokeObjectURL(video.src);
          resolve(keyframes);
        }
      };
      
      // 开始采样第一帧
      captureFrame(0);
    };
    
    // 视频加载失败处理
    video.onerror = (e) => {
      console.error('视频加载失败:', e);
      URL.revokeObjectURL(video.src);
      resolve([]);
    };
    
    // 视频加载元数据处理
    video.onloadedmetadata = () => {
      // 检查视频是否有有效尺寸
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        console.error('视频尺寸无效');
        URL.revokeObjectURL(video.src);
        resolve([]);
        return;
      }
      // 继续加载，等待canplaythrough事件
    };
    
    // 设置视频源
    video.src = URL.createObjectURL(file);
    
    // 尝试播放视频，触发加载
    video.load();
  });
};

// 估算帧率（简化版）
const estimateFps = (_video: HTMLVideoElement): number => {
  // 简化实现：根据常见视频格式返回估计值
  // 实际应用中可以通过更复杂的分析来获取准确帧率
  return 30; // 默认30fps
};

// 分析视频类型
export const analyzeVideoType = (filename: string): string => {
  const extension = filename.split('.').pop()?.toLowerCase() || '';
  const videoExtensions = {
    'mp4': 'mp4',
    'webm': 'webm',
    'ogg': 'ogg',
    'mov': 'mov',
    'avi': 'avi',
    'mkv': 'mkv'
  };
  
  return videoExtensions[extension as keyof typeof videoExtensions] || 'unknown';
};

// 分类视频长度
export const categorizeVideoLength = (duration: number): 'short' | 'medium' | 'long' => {
  if (duration < 60) return 'short'; // 小于1分钟
  if (duration < 300) return 'medium'; // 1-5分钟
  return 'long'; // 大于5分钟
};

// 分类分辨率
export const categorizeResolution = (width: number, height: number): 'sd' | 'hd' | 'fullhd' | '4k' => {
  if (width >= 3840 && height >= 2160) return '4k';
  if (width >= 1920 && height >= 1080) return 'fullhd';
  if (width >= 1280 && height >= 720) return 'hd';
  return 'sd';
};

// 视频提示词优化
export const optimizeVideoPrompt = (basePrompt: string, features: Record<string, any>, keyframes: string[] = []): string => {
  let optimizedPrompt = basePrompt;
  
  // 根据视频特征优化提示词
  if (features.resolutionCategory) {
    optimizedPrompt += `, ${features.resolutionCategory.toUpperCase()} resolution`;
  }
  
  if (features.aspectRatio) {
    if (features.aspectRatio > 1.5) {
      optimizedPrompt += ', wide aspect ratio';
    } else if (features.aspectRatio < 0.75) {
      optimizedPrompt += ', vertical aspect ratio (portrait)';
    } else {
      optimizedPrompt += ', square aspect ratio';
    }
  }
  
  if (features.lengthCategory) {
    optimizedPrompt += `, ${features.lengthCategory} video (${Math.round(features.duration)} seconds)`;
  }
  
  // 关键帧信息增强
  if (keyframes.length > 0) {
    optimizedPrompt += `, based on ${keyframes.length} keyframes`;
  }
  
  // 添加视频特定描述
  optimizedPrompt += ', smooth motion, clear visuals, well-lit scenes';
  
  // 根据视频长度调整细节程度
  if (features.lengthCategory === 'long') {
    optimizedPrompt += ', detailed scene transitions, consistent lighting throughout';
  }
  
  return optimizedPrompt;
};

// 视频内容分析（简化版，基于文件名和时长）
export const analyzeVideoContent = (filename: string, duration: number): string => {
  // 简化实现：基于文件名关键词分析
  const lowerFilename = filename.toLowerCase();
  
  const contentTypes = [
    { regex: /(tutorial|guide|howto|learn)/, type: 'tutorial' },
    { regex: /(demo|demonstration|showcase)/, type: 'demonstration' },
    { regex: /(music|song|audio|sound)/, type: 'music' },
    { regex: /(game|gaming|playthrough)/, type: 'gaming' },
    { regex: /(vlog|blog|daily)/, type: 'vlog' },
    { regex: /(movie|film|short|cinema)/, type: 'cinematic' },
    { regex: /(news|report|update)/, type: 'news' },
    { regex: /(product|review|unboxing)/, type: 'product review' }
  ];
  
  for (const contentType of contentTypes) {
    if (contentType.regex.test(lowerFilename)) {
      return contentType.type;
    }
  }
  
  // 根据时长进一步推测
  if (duration > 300) { // 大于5分钟
    return 'long-form content';
  } else if (duration > 60) { // 1-5分钟
    return 'medium-form content';
  } else { // 小于1分钟
    return 'short-form content';
  }
};