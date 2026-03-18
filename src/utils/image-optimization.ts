// 图像优化工具，用于增强反向工程的精准度

// 图像特征提取与增强
export const enhanceImageFeatures = async (file: File): Promise<Record<string, any>> => {
  return new Promise((resolve) => {
    // 创建图像元素加载文件
    const img = new Image();
    img.onload = () => {
      // 创建画布进行图像处理
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve({});
        return;
      }

      // 设置画布尺寸
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // 提取基本特征
      const features = {
        dimensions: { width: img.width, height: img.height },
        aspectRatio: img.width / img.height,
        // 简单的色彩分析
        dominantColors: extractDominantColors(ctx, canvas.width, canvas.height),
        // 边缘检测（简化版）
        hasStrongEdges: detectStrongEdges(ctx, canvas.width, canvas.height),
        // 亮度分析
        brightness: analyzeBrightness(ctx, canvas.width, canvas.height),
        // 纹理复杂度
        textureComplexity: analyzeTexture(ctx, canvas.width, canvas.height)
      };

      resolve(features);
    };
    img.src = URL.createObjectURL(file);
  });
};

// 提取主色调
const extractDominantColors = (ctx: CanvasRenderingContext2D, width: number, height: number): string[] => {
  // 简化实现：采样几个点的颜色
  const samplePoints = [
    { x: width * 0.25, y: height * 0.25 },
    { x: width * 0.75, y: height * 0.25 },
    { x: width * 0.25, y: height * 0.75 },
    { x: width * 0.75, y: height * 0.75 },
    { x: width * 0.5, y: height * 0.5 }
  ];

  return samplePoints.map(point => {
    const pixel = ctx.getImageData(point.x, point.y, 1, 1).data;
    return `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
  });
};

// 检测强边缘（简化版）
const detectStrongEdges = (ctx: CanvasRenderingContext2D, width: number, height: number): boolean => {
  // 简化实现：检查图像对比度
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  let totalContrast = 0;
  let pixelCount = 0;

  // 采样每10个像素
  for (let y = 0; y < height; y += 10) {
    for (let x = 0; x < width; x += 10) {
      const index = (y * width + x) * 4;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      const brightness = (r + g + b) / 3;
      totalContrast += brightness;
      pixelCount++;
    }
  }

  const avgBrightness = totalContrast / pixelCount;
  // 计算对比度（简化版：检查与平均亮度的偏差）
  let contrast = 0;
  pixelCount = 0;
  
  for (let y = 0; y < height; y += 10) {
    for (let x = 0; x < width; x += 10) {
      const index = (y * width + x) * 4;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      const brightness = (r + g + b) / 3;
      contrast += Math.abs(brightness - avgBrightness);
      pixelCount++;
    }
  }

  const avgContrast = contrast / pixelCount;
  return avgContrast > 30; // 阈值可调整
};

// 分析亮度
const analyzeBrightness = (ctx: CanvasRenderingContext2D, width: number, height: number): 'dark' | 'medium' | 'bright' => {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  let totalBrightness = 0;
  let pixelCount = 0;

  for (let y = 0; y < height; y += 5) {
    for (let x = 0; x < width; x += 5) {
      const index = (y * width + x) * 4;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      totalBrightness += (r + g + b) / 3;
      pixelCount++;
    }
  }

  const avgBrightness = totalBrightness / pixelCount;
  
  if (avgBrightness < 85) return 'dark';
  if (avgBrightness > 170) return 'bright';
  return 'medium';
};

// 分析纹理复杂度
const analyzeTexture = (ctx: CanvasRenderingContext2D, width: number, height: number): 'simple' | 'moderate' | 'complex' => {
  // 简化实现：分析像素值变化
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  let edgeCount = 0;
  let pixelCount = 0;

  // 检查相邻像素的差异
  for (let y = 0; y < height - 1; y += 8) {
    for (let x = 0; x < width - 1; x += 8) {
      const index1 = (y * width + x) * 4;
      const index2 = (y * width + x + 1) * 4;
      const index3 = ((y + 1) * width + x) * 4;
      
      const brightness1 = (data[index1] + data[index1 + 1] + data[index1 + 2]) / 3;
      const brightness2 = (data[index2] + data[index2 + 1] + data[index2 + 2]) / 3;
      const brightness3 = (data[index3] + data[index3 + 1] + data[index3 + 2]) / 3;
      
      // 检查水平和垂直差异
      if (Math.abs(brightness1 - brightness2) > 20 || Math.abs(brightness1 - brightness3) > 20) {
        edgeCount++;
      }
      pixelCount++;
    }
  }

  const edgeRatio = edgeCount / pixelCount;
  
  if (edgeRatio < 0.15) return 'simple';
  if (edgeRatio > 0.35) return 'complex';
  return 'moderate';
};

// 优化图像提示词
export const optimizeImagePrompt = (basePrompt: string, features: Record<string, any>): string => {
  let optimizedPrompt = basePrompt;
  
  // 根据特征优化提示词
  if (features.brightness) {
    optimizedPrompt += `, ${features.brightness} lighting`;
  }
  
  if (features.textureComplexity) {
    optimizedPrompt += `, ${features.textureComplexity} texture`;
  }
  
  if (features.hasStrongEdges) {
    optimizedPrompt += ', strong edges and clear outlines';
  }
  
  if (features.aspectRatio) {
    if (features.aspectRatio > 1.5) {
      optimizedPrompt += ', wide aspect ratio';
    } else if (features.aspectRatio < 0.75) {
      optimizedPrompt += ', tall aspect ratio';
    } else {
      optimizedPrompt += ', square aspect ratio';
    }
  }
  
  // 添加构图建议
  optimizedPrompt += ', well-composed, balanced composition';
  
  return optimizedPrompt;
};