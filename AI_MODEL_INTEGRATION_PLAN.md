# AI大模型集成技术方案

## 1. 问题背景

当前系统生成的反推提示词与用户上传的文件内容毫不相关，主要原因是系统使用模拟数据，没有实际调用AI大模型进行内容分析和提示词生成。

## 2. 解决方案

集成真实的AI大模型，基于用户上传的文件内容生成相关的反推提示词。

## 3. 技术架构

### 3.1 系统架构图

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   前端应用      │     │   后端服务      │     │   AI大模型服务  │
│  (React + TS)   │────▶│  (Express.js)   │────▶│  (OpenAI/GPT等) │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### 3.2 核心流程

1. **文件上传**：用户通过前端上传文件
2. **文件解析**：后端解析文件内容
3. **AI模型调用**：基于解析内容调用AI大模型生成提示词
4. **结果返回**：将生成的提示词返回给前端
5. **结果展示**：前端展示反推结果

## 4. AI模型选择

### 4.1 推荐模型

| 模型类型 | 推荐模型 | 优势 |
|---------|---------|------|
| 文本反推 | GPT-4o, Claude 3, Gemini 3 | 强大的文本理解和生成能力 |
| 图像反推 | GPT-4o Vision, Gemini 3 Vision, Claude 3 Opus | 优秀的图像理解能力 |
| 视频反推 | Runway Gen-4, Gemini 3 Vision | 视频内容分析能力 |

### 4.2 混合模型策略

- 文本反推：优先使用DeepSeek V4（成本较低）
- 图像反推：优先使用GPT-4o Vision（理解能力强）
- 视频反推：优先使用Runway Gen-4（视频分析能力强）

## 5. 技术实现

### 5.1 前端实现

#### 5.1.1 配置管理

```typescript
// src/services/api.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
const USE_MOCK_DATA = false; // 生产环境设为false
```

#### 5.1.2 文件上传组件

- 保持现有上传组件不变
- 优化文件类型检测
- 增强错误处理

### 5.2 后端实现

#### 5.2.1 AI模型集成

```javascript
// server/ai-models.js
const axios = require('axios');

// OpenAI模型调用
exports.callOpenAI = async (prompt, content, type) => {
  const response = await axios.post('https://api.openai.com/v1/chat/completions', {
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `你是一个AI反向工程专家，根据用户提供的${type}内容生成准确的提示词。`
      },
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: type, text: content }
        ]
      }
    ]
  }, {
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });
  
  return response.data.choices[0].message.content;
};

// DeepSeek模型调用
exports.callDeepSeek = async (prompt, content, type) => {
  // 实现DeepSeek模型调用
};
```

#### 5.2.2 反向提示词生成API

```javascript
// server/index.js
const { callOpenAI, callDeepSeek } = require('./ai-models');

// 反向提示词生成API
apiRouter.post('/reverse-prompt', async (req, res) => {
  try {
    const { fileType, fileData, budget = 0, qualityRequired = 80 } = req.body;
    
    // 解析文件内容
    const content = await parseDocumentContent(fileData, fileType);
    
    // 选择模型
    const selectedModel = selectModel('reverseEngineering', budget, qualityRequired);
    
    // 生成提示词
    let prompt = '';
    if (selectedModel === 'gpt-4o') {
      prompt = await callOpenAI('根据以下内容生成反推提示词:', content, fileType);
    } else if (selectedModel === 'deepseek-v4') {
      prompt = await callDeepSeek('根据以下内容生成反推提示词:', content, fileType);
    }
    
    // 生成结构化提示词
    const result = generatePromptFromContent(content, fileType, models.reverseEngineering.options[selectedModel]);
    result.prompt = prompt; // 使用真实生成的提示词
    
    res.json(result);
  } catch (error) {
    console.error('Error in reverse prompt generation:', error);
    res.status(500).json({ error: `Failed to generate reverse prompt: ${error.message}` });
  }
});
```

#### 5.2.3 环境变量配置

```env
# server/.env
# AI模型API密钥
OPENAI_API_KEY=your_openai_api_key_here
DEEPSEEK_API_KEY=your_deepseek_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
GOOGLE_API_KEY=your_google_api_key_here

# 模型配置
DEFAULT_REVERSE_ENGINEERING_MODEL=deepseek-v4
DEFAULT_IMAGE_GENERATION_MODEL=dall-e-4
DEFAULT_VIDEO_GENERATION_MODEL=runway-gen-4
```

### 5.3 文档解析增强

#### 5.3.1 图像文件处理

```javascript
// server/image-processing.js
const sharp = require('sharp');
const { callOpenAI } = require('./ai-models');

// 图像内容分析
exports.analyzeImage = async (buffer) => {
  // 图像优化
  const optimizedImage = await sharp(buffer)
    .resize(1024, 1024, { fit: 'inside' })
    .jpeg({ quality: 80 })
    .toBuffer();
  
  // 转换为base64
  const base64Image = optimizedImage.toString('base64');
  
  // 调用AI模型分析图像
  const analysis = await callOpenAI(
    '分析以下图像内容，描述图像的主题、风格、色彩、构图等:',
    base64Image,
    'image'
  );
  
  return analysis;
};
```

#### 5.3.2 视频文件处理

```javascript
// server/video-processing.js
const ffmpeg = require('fluent-ffmpeg');

// 视频关键帧提取
exports.extractKeyFrames = async (buffer) => {
  // 实现视频关键帧提取逻辑
};
```

## 6. 部署与配置

### 6.1 部署架构

- **开发环境**：本地部署
- **测试环境**：云服务器部署
- **生产环境**：容器化部署（Docker + Kubernetes）

### 6.2 配置管理

- 使用环境变量管理敏感信息
- 配置文件版本控制
- 支持动态配置更新

## 7. 测试与验证

### 7.1 测试用例

| 测试场景 | 预期结果 |
|---------|---------|
| 上传PDF文档 | 生成与文档内容相关的提示词 |
| 上传图片 | 生成与图片内容相关的提示词 |
| 上传文本文件 | 生成与文本内容相关的提示词 |
| 上传视频 | 生成与视频内容相关的提示词 |

### 7.2 性能测试

- 响应时间测试
- 并发请求测试
- 不同文件大小的处理性能

## 8. 监控与日志

### 8.1 监控指标

- API响应时间
- 成功率
- 错误率
- 模型调用次数
- 成本消耗

### 8.2 日志记录

- 请求日志
- 模型调用日志
- 错误日志
- 性能日志

## 9. 成本控制

### 9.1 成本优化策略

- 合理设置模型参数（如max_tokens, temperature）
- 缓存重复请求
- 使用成本较低的模型
- 限制模型调用频率

### 9.2 成本监控

- 实时监控API调用成本
- 设置成本阈值告警
- 生成成本报表

## 10. 风险与应对

### 10.1 风险识别

- API密钥泄露风险
- 模型调用失败风险
- 生成结果不符合预期风险
- 成本超支风险

### 10.2 应对措施

- 严格的密钥管理
- 完善的错误处理和重试机制
- 结果质量评估和优化
- 成本监控和限制

## 11. 实施计划

### 11.1 阶段一：基础架构搭建（1-2周）

- 配置开发环境
- 安装依赖库
- 实现基础的AI模型调用

### 11.2 阶段二：核心功能开发（2-3周）

- 文件解析增强
- AI模型集成
- API开发

### 11.3 阶段三：测试与优化（1-2周）

- 单元测试
- 集成测试
- 性能优化

### 11.4 阶段四：部署与上线（1周）

- 部署到测试环境
- 功能验证
- 部署到生产环境

## 12. 预期效果

- 生成的反推提示词与用户上传的文件内容高度相关
- 支持多种文件格式
- 提供高质量的结构化提示词
- 系统稳定可靠

## 13. 技术栈

- **前端**：React, TypeScript, Vite
- **后端**：Express.js, Node.js
- **AI模型**：OpenAI API, DeepSeek API, Google AI API
- **文档处理**：pdf-parse, docx, xlsx
- **图像处理**：sharp
- **视频处理**：fluent-ffmpeg
- **部署**：Docker, Kubernetes

## 14. 后续优化方向

- 支持更多AI模型
- 实现模型微调
- 增强结果质量评估
- 优化用户体验
- 支持多语言

## 15. 结论

集成真实的AI大模型是解决反推提示词与文件内容不相关问题的有效方案。通过合理的架构设计和模型选择，可以生成高质量、相关的反推提示词，提升系统的实用性和用户体验。