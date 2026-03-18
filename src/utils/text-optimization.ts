// 文案优化工具，用于增强反向工程的精准度

// 文案特征提取与增强
export const enhanceTextFeatures = async (text: string): Promise<Record<string, any>> => {
  // 提取文本基本特征
  const words = text.split(/\s+/).filter(word => word.length > 0);
  const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
  
  // 简单的语义分析
  const features = {
    wordCount: words.length,
    sentenceCount: sentences.length,
    averageWordLength: words.reduce((sum, word) => sum + word.length, 0) / words.length,
    averageSentenceLength: sentences.reduce((sum, sentence) => sum + sentence.split(/\s+/).filter(w => w.length > 0).length, 0) / sentences.length,
    
    // 关键词提取（简化版）
    keywords: extractKeywords(text),
    
    // 情感分析（简化版）
    sentiment: analyzeSentiment(text),
    
    // 语气分析
    tone: analyzeTone(text),
    
    // 风格分析
    style: analyzeStyle(text),
    
    // 领域识别（简化版）
    domain: identifyDomain(text)
  };
  
  return features;
};

// 提取关键词（简化版：基于词频）
const extractKeywords = (text: string): string[] => {
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'to', 'of', 'in', 'for', 'with', 'on', 'at', 'by', 'from', 'up', 'about', 'into', 'over', 'after', 'out', 'between', 'through', 'during', 'before', 'under', 'around', 'among', 'like', 'as', 'than', 'so', 'because', 'since', 'if', 'while', 'although', 'though', 'when', 'where', 'who', 'whom', 'which', 'that', 'this', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'mine', 'yours', 'his', 'hers', 'ours', 'theirs', 'myself', 'yourself', 'himself', 'herself', 'itself', 'ourselves', 'yourselves', 'themselves'
  ]);
  
  const wordFrequency: Record<string, number> = {};
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  
  words.forEach(word => {
    if (!stopWords.has(word) && word.length > 2) {
      wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    }
  });
  
  // 按词频排序，取前10个关键词
  return Object.entries(wordFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
};

// 情感分析（简化版：基于关键词匹配）
const analyzeSentiment = (text: string): 'positive' | 'neutral' | 'negative' => {
  const positiveWords = new Set(['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'awesome', 'perfect', 'happy', 'joy', 'love', 'like', 'enjoy', 'beautiful', 'best', 'better', 'superb', 'outstanding', 'impressive', 'brilliant']);
  const negativeWords = new Set(['bad', 'terrible', 'awful', 'horrible', 'worst', 'worse', 'poor', 'ugly', 'sad', 'hate', 'dislike', 'terrible', 'disappointing', 'frustrating', 'boring', 'difficult', 'hard', 'annoying', 'problem']);
  
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  let positiveCount = 0;
  let negativeCount = 0;
  
  words.forEach(word => {
    if (positiveWords.has(word)) positiveCount++;
    if (negativeWords.has(word)) negativeCount++;
  });
  
  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
};

// 语气分析
const analyzeTone = (text: string): 'formal' | 'informal' | 'professional' | 'casual' => {
  const formalWords = new Set(['therefore', 'hence', 'however', 'moreover', 'furthermore', 'consequently', 'nevertheless', 'thus', 'accordingly', 'whereas']);
  const informalWords = new Set(['yeah', 'yep', 'nope', 'gonna', 'wanna', 'gotta', 'ain\'t', 'don\'t', 'can\'t', 'won\'t', 'let\'s', 'omg', 'lol', 'btw', 'thx', 'ty']);
  
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  let formalCount = 0;
  let informalCount = 0;
  
  words.forEach(word => {
    if (formalWords.has(word)) formalCount++;
    if (informalWords.has(word)) informalCount++;
  });
  
  if (formalCount > informalCount) return text.includes('!') ? 'professional' : 'formal';
  if (informalCount > formalCount) return text.includes('!') || text.includes(':)') ? 'casual' : 'informal';
  
  // 基于句子长度判断
  const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
  const avgSentenceLength = sentences.reduce((sum, sentence) => sum + sentence.split(/\s+/).filter(w => w.length > 0).length, 0) / sentences.length;
  
  return avgSentenceLength > 15 ? 'professional' : 'casual';
};

// 风格分析
const analyzeStyle = (text: string): 'descriptive' | 'narrative' | 'expository' | 'persuasive' => {
  // 简化实现：基于文本特征判断
  const hasDescriptiveWords = /(beautiful|wonderful|amazing|colorful|bright|dark|soft|hard|smooth|rough|loud|quiet)/i.test(text);
  const hasNarrativeElements = /(once|then|next|after|before|while|when|suddenly|finally|meanwhile)/i.test(text);
  const hasExpositoryElements = /(explain|describe|define|introduce|present|show|demonstrate)/i.test(text);
  const hasPersuasiveElements = /(should|must|need|ought|believe|think|feel|consider|suggest|recommend)/i.test(text);
  
  if (hasPersuasiveElements) return 'persuasive';
  if (hasNarrativeElements) return 'narrative';
  if (hasExpositoryElements) return 'expository';
  if (hasDescriptiveWords) return 'descriptive';
  return 'expository';
};

// 领域识别（简化版）
const identifyDomain = (text: string): string => {
  const domains = {
    'technology': /(software|hardware|computer|programming|code|algorithm|AI|artificial intelligence|machine learning|data|cloud|internet|web|app|application)/i,
    'business': /(company|business|market|sales|marketing|finance|economy|investment|profit|revenue|customer|client|product|service)/i,
    'education': /(learn|study|teach|teacher|student|school|university|college|education|course|lesson|knowledge|skill|training)/i,
    'health': /(health|medical|doctor|nurse|hospital|disease|illness|treatment|medicine|healthcare|wellness|fitness|exercise|diet)/i,
    'entertainment': /(movie|film|music|song|artist|band|book|novel|author|game|play|theater|entertainment|show|performance)/i,
    'science': /(science|scientific|research|experiment|study|discovery|theory|hypothesis|law|principle|fact|data|analysis)/i,
    'art': /(art|artist|painting|drawing|sculpture|music|literature|poetry|theater|performance|creative|design|style|technique)/i
  };
  
  for (const [domain, regex] of Object.entries(domains)) {
    if (regex.test(text)) {
      return domain;
    }
  }
  
  return 'general';
};

// 优化文案提示词
export const optimizeTextPrompt = (basePrompt: string, features: Record<string, any>): string => {
  let optimizedPrompt = basePrompt;
  
  // 根据特征优化提示词
  if (features.domain) {
    optimizedPrompt += `, in the ${features.domain} domain`;
  }
  
  if (features.tone) {
    optimizedPrompt += `, ${features.tone} tone`;
  }
  
  if (features.sentiment) {
    optimizedPrompt += `, ${features.sentiment} sentiment`;
  }
  
  if (features.style) {
    optimizedPrompt += `, ${features.style} style`;
  }
  
  if (features.keywords && features.keywords.length > 0) {
    optimizedPrompt += `, including keywords: ${features.keywords.slice(0, 5).join(', ')}`;
  }
  
  // 添加结构建议
  optimizedPrompt += `, with ${features.sentenceCount} sentences, ${features.wordCount} words`;
  
  // 添加质量要求
  optimizedPrompt += ', well-structured, coherent, engaging';
  
  return optimizedPrompt;
};