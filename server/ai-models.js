// AI模型调用模块
const axios = require('axios');

// 配置日志
const logger = {
  info: (message) => console.log(`[INFO] ${new Date().toISOString()} - ${message}`),
  error: (message, error) => console.error(`[ERROR] ${new Date().toISOString()} - ${message}: ${error.message}`)
};

// OpenAI模型调用
exports.callOpenAI = async (prompt, content, type, model = 'gpt-4o') => {
  logger.info(`Calling OpenAI ${model} for ${type} processing`);
  
  try {
    // 构建消息
    const messages = [
      {
        role: 'system',
        content: `你是一个AI反向工程专家，根据用户提供的${type}内容生成准确的提示词。`
      }
    ];
    
    // 根据内容类型构建用户消息
    if (type === 'image') {
      messages.push({
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${content}` } }
        ]
      });
    } else {
      messages.push({
        role: 'user',
        content: `${prompt}\n\n内容: ${content}`
      });
    }
    
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: model,
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY || 'your_openai_api_key_here'}`,
        'Content-Type': 'application/json'
      }
    });
    
    logger.info(`OpenAI ${model} call successful`);
    return response.data.choices[0].message.content;
  } catch (error) {
    logger.error(`OpenAI ${model} call failed`, error);
    throw new Error(`OpenAI调用失败: ${error.message}`);
  }
};

// DeepSeek模型调用
exports.callDeepSeek = async (prompt, content, type, model = 'deepseek-v4') => {
  logger.info(`Calling DeepSeek ${model} for ${type} processing`);
  
  try {
    const messages = [
      {
        role: 'system',
        content: `你是一个AI反向工程专家，根据用户提供的${type}内容生成准确的提示词。`
      },
      {
        role: 'user',
        content: `${prompt}\n\n内容: ${content}`
      }
    ];
    
    const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
      model: model,
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY || 'your_deepseek_api_key_here'}`,
        'Content-Type': 'application/json'
      }
    });
    
    logger.info(`DeepSeek ${model} call successful`);
    return response.data.choices[0].message.content;
  } catch (error) {
    logger.error(`DeepSeek ${model} call failed`, error);
    throw new Error(`DeepSeek调用失败: ${error.message}`);
  }
};

// Google Gemini模型调用
exports.callGoogleGemini = async (prompt, content, type, model = 'gemini-3-pro') => {
  logger.info(`Calling Google Gemini ${model} for ${type} processing`);
  
  try {
    const geminiApiKey = process.env.GOOGLE_API_KEY || 'your_google_api_key_here';
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`;
    
    let contents = [];
    
    // 系统提示
    contents.push({
      parts: [{ text: `你是一个AI反向工程专家，根据用户提供的${type}内容生成准确的提示词。` }]
    });
    
    // 用户内容
    if (type === 'image') {
      contents.push({
        parts: [
          { text: prompt },
          { inline_data: { mime_type: 'image/jpeg', data: content } }
        ]
      });
    } else {
      contents.push({
        parts: [{ text: `${prompt}\n\n内容: ${content}` }]
      });
    }
    
    const response = await axios.post(apiUrl, {
      contents: contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000
      }
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    logger.info(`Google Gemini ${model} call successful`);
    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    logger.error(`Google Gemini ${model} call failed`, error);
    throw new Error(`Google Gemini调用失败: ${error.message}`);
  }
};

// 统一模型调用接口
exports.callAIModel = async (modelName, prompt, content, type, modelParams = {}) => {
  logger.info(`Calling AI model: ${modelName} for ${type} processing`);
  
  try {
    let result;
    
    // 根据模型名称调用相应的模型
    switch (modelName.toLowerCase()) {
      case 'openai':
      case 'gpt-4o':
      case 'gpt-4-turbo':
      case 'gpt-3.5-turbo':
        result = await exports.callOpenAI(prompt, content, type, modelParams.model || modelName);
        break;
        
      case 'deepseek':
      case 'deepseek-v4':
      case 'deepseek-v3':
        result = await exports.callDeepSeek(prompt, content, type, modelParams.model || modelName);
        break;
        
      case 'gemini':
      case 'gemini-3-pro':
      case 'gemini-3-vision':
        result = await exports.callGoogleGemini(prompt, content, type, modelParams.model || modelName);
        break;
        
      default:
        throw new Error(`不支持的AI模型: ${modelName}`);
    }
    
    return {
      success: true,
      result: result,
      model: modelName,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    logger.error(`AI model call failed`, error);
    return {
      success: false,
      error: error.message,
      model: modelName,
      timestamp: new Date().toISOString()
    };
  }
};

// 获取支持的模型列表
exports.getSupportedModels = () => {
  return {
    reverseEngineering: {
      default: 'deepseek-v4',
      options: {
        'deepseek-v4': {
          name: 'DeepSeek V4',
          cost: 0.05,
          quality: 85,
          speed: 70
        },
        'gpt-4o': {
          name: 'GPT-4o',
          cost: 0.15,
          quality: 95,
          speed: 60
        },
        'gemini-3-pro': {
          name: 'Gemini 3 Pro',
          cost: 0.12,
          quality: 92,
          speed: 65
        }
      }
    },
    imageGeneration: {
      default: 'dall-e-4',
      options: {
        'dall-e-4': {
          name: 'DALL-E 4',
          cost: 0.20,
          quality: 98,
          speed: 50
        },
        'midjourney-v7': {
          name: 'MidJourney V7',
          cost: 0.18,
          quality: 96,
          speed: 55
        },
        'deepseek-v4': {
          name: 'DeepSeek V4',
          cost: 0.08,
          quality: 88,
          speed: 70
        }
      }
    },
    videoGeneration: {
      default: 'runway-gen-4',
      options: {
        'runway-gen-4': {
          name: 'Runway Gen-4',
          cost: 0.30,
          quality: 94,
          speed: 45
        },
        'deepseek-v4': {
          name: 'DeepSeek V4',
          cost: 0.15,
          quality: 85,
          speed: 60
        }
      }
    },
    textGeneration: {
      default: 'deepseek-v4',
      options: {
        'deepseek-v4': {
          name: 'DeepSeek V4',
          cost: 0.05,
          quality: 90,
          speed: 80
        },
        'gpt-4o': {
          name: 'GPT-4o',
          cost: 0.10,
          quality: 98,
          speed: 70
        }
      }
    }
  };
};