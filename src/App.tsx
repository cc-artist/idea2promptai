import React, { useState } from 'react'
import { UploadedItem, GenerateResult } from './types'
import apiService from './services/api'

// 简化的App组件，优化布局和用户体验
function App() {
  const [uploadedItems, setUploadedItems] = useState<UploadedItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentUploadType, setCurrentUploadType] = useState<string>('');
  const [generatedResults, setGeneratedResults] = useState<Record<string, GenerateResult>>({});
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  console.log('App组件渲染');

  const getConfidenceBadgeClass = (confidence: number) => {
    if (confidence >= 80) return 'confidence-badge high';
    if (confidence >= 60) return 'confidence-badge medium';
    return 'confidence-badge low';
  };

  // 模拟进度更新
  const simulateProgress = () => {
    let currentProgress = 0;
    // 确保进度从0开始
    setProgress(0);
    
    // 使用setTimeout递归调用，避免阻塞事件循环
    // 每200ms更新一次，确保4秒内完成100%进度
    const updateProgress = () => {
      if (currentProgress < 100) {
        currentProgress += 5;
        setProgress(Math.min(currentProgress, 100));
        setTimeout(updateProgress, 200);
      }
    };
    
    updateProgress();
  };







  // 基于提示词生成成果 - 调用后端API
  const generateFromPrompt = async (itemId: string, prompt: string, itemType: 'image' | 'video' | 'text') => {
    console.log('开始生成成果:', itemId, prompt);
    setGenerating(itemId);
    setGenerationProgress(0);
    
    // 模拟生成进度
    const simulateGenerationProgress = async () => {
      let currentProgress = 0;
      while (currentProgress < 100 && generating === itemId) {
        await new Promise(resolve => setTimeout(resolve, 150));
        currentProgress += 5;
        setGenerationProgress(Math.min(currentProgress, 100));
      }
    };
    
    simulateGenerationProgress();
    
    try {
      // 调用后端API生成成果，后端自动选择模型
      const result = await apiService.generation.generateFromPrompt(
        prompt, 
        itemType === 'text' ? 'text' : 'image'
      );
      
      const generateResult: GenerateResult = {
        id: result.id,
        type: result.type as 'image' | 'text',
        content: result.content,
        prompt: result.prompt
      };
      
      setGeneratedResults(prev => ({
        ...prev,
        [itemId]: generateResult
      }));
      
      console.log('生成成果完成:', itemId, generateResult);
    } catch (error) {
      console.error('生成成果错误:', error);
      alert('生成成果失败，请重试');
    } finally {
      setGenerating(null);
      setGenerationProgress(0);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('开始处理文件上传');
    const file = e.target.files?.[0];
    if (!file) return;

    // 清除之前的错误信息
    setUploadError(null);

    // 确定文件类型
    let fileType: 'image' | 'video' | 'text' = 'text';
    if (file.type.startsWith('image')) {
      fileType = 'image';
    } else if (file.type.startsWith('video')) {
      fileType = 'video';
    } else {
      fileType = 'text';
    }

    setCurrentUploadType(fileType === 'image' ? '图像' : fileType === 'video' ? '视频' : '文档');
    setUploading(true);
    setProgress(0);

    // 开始模拟进度
    simulateProgress();

    try {
      // 调用后端API获取反向提示词，后端自动选择模型
      const result = await apiService.reverseEngineering.generateReversePrompt(
        file, 
        fileType
      );
      
      const newItem: UploadedItem = {
        id: Date.now().toString(),
        type: fileType,
        content: fileType === 'text' ? `文档名称: ${file.name}\n文档大小: ${(file.size / 1024).toFixed(2)} KB\n文档类型: ${file.type}` : URL.createObjectURL(file),
        confidence: result.confidence,
        prompt: result.prompt,
        structuredPrompt: result.structuredPrompt,
        params: result.params,
        workflow: result.workflow,
      };
      setUploadedItems(prev => [...prev, newItem]);
      console.log('文件上传处理完成');
    } catch (error) {
      console.error('文件上传错误:', error);
      // 设置上传错误信息，不使用alert
      setUploadError(`文件处理失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };



  return (
    <div className="app">
      <header className="app-header">
        <h1>AI 反向工程</h1>
        <div className="plan-info">
          <span className="current-plan">当前套餐: 免费版</span>
          <span className="remaining-usage">剩余次数: 10</span>
        </div>
      </header>
      
      <main className="app-main">
        {/* 上传区域 */}
        <section className="upload-section">
          <h2>上传内容</h2>
          
          <div className="upload-container">
            {/* 图像/视频上传 */}
            <div className="upload-area">
              {uploading && (currentUploadType === '图像' || currentUploadType === '视频' || currentUploadType === '文档') ? (
                <div className="loading-container">
                  <div className="circular-progress-container">
                    <svg className="circular-progress" width="120" height="120" viewBox="0 0 120 120">
                      <g transform="rotate(-90 60 60)">
                        {/* 背景圆环 */}
                        <circle
                          className="progress-background"
                          cx="60"
                          cy="60"
                          r="54"
                          strokeWidth="12"
                          fill="none"
                        />
                        {/* 进度圆环 */}
                        <circle
                          className="progress-ring"
                          cx="60"
                          cy="60"
                          r="54"
                          strokeWidth="12"
                          fill="none"
                          strokeLinecap="round"
                          strokeDasharray="339.292"
                          strokeDashoffset={339.292 * (1 - progress / 100)}
                        />
                      </g>
                      {/* 中心点 */}
                      <circle
                        className="progress-center"
                        cx="60"
                        cy="60"
                        r="45"
                        fill="none"
                      />
                      {/* 进度文字 - 不再需要旋转，因为旋转只应用到圆环组 */}
                      <text
                        x="60"
                        y="60"
                        className="progress-text"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="24"
                        fontWeight="bold"
                        fill="#ffffff"
                      >
                        {progress}%
                      </text>
                    </svg>
                    <div className="loading-text" style={{ marginTop: '1rem' }}>{currentUploadType}处理中...</div>
                    <div className="loading-subtext">正在分析内容，请稍候...</div>
                  </div>
                </div>
              ) : uploadError ? (
                <div className="upload-error-container">
                  <div className="upload-error-icon">❌</div>
                  <div className="upload-error-text">{uploadError}</div>
                  <button 
                    className="upload-error-retry"
                    onClick={() => setUploadError(null)}
                  >
                    重试上传
                  </button>
                </div>
              ) : (
                <>
                  <label htmlFor="file-upload" className="file-upload-label">
                    <div className="upload-icon">+</div>
                    <p>上传图像、视频或文档</p>
                    <small style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: '#666' }}>
                      支持 JPG, PNG, MP4, WebM, PDF, DOC, DOCX, TXT 等格式
                    </small>
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                    onChange={handleFileUpload}
                    className="file-upload-input"
                    disabled={uploading}
                  />
                </>
              )}
            </div>


          </div>
        </section>

        {/* 结果显示区域 - 只在有上传内容时显示 */}
        {uploadedItems.length > 0 && (
          <section className="results-section">
            <h2>反推结果</h2>
            <div className="results-list">
              {uploadedItems.map((item) => (
                <div key={item.id} className="result-item">
                  <div className="result-header">
                    <span className="result-type">{item.type === 'image' ? '图像' : item.type === 'video' ? '视频' : '文档'}</span>
                    <span className={getConfidenceBadgeClass(item.confidence)}>
                      {item.confidence}%
                    </span>
                  </div>
                  
                  <div className="result-content">
                    {item.type === 'image' && (
                      <img 
                        src={item.content} 
                        alt="Uploaded" 
                        className="result-image" 
                        loading="lazy"
                      />
                    )}
                    {item.type === 'video' && (
                      <video 
                        src={item.content} 
                        controls 
                        className="result-video" 
                        preload="metadata"
                        style={{ width: '100%', height: 'auto', maxHeight: '400px', objectFit: 'cover' }}
                      >
                        您的浏览器不支持视频播放
                      </video>
                    )}
                    {item.type === 'text' && (
                      <div className="result-text">{item.content}</div>
                    )}
                  </div>
                  
                  {/* 置信度说明 */}
                  <div style={{ 
                    backgroundColor: '#1a1a1a', 
                    padding: '1rem', 
                    borderRadius: '0.5rem',
                    fontSize: '0.9rem',
                    color: '#a0a0a0',
                    borderLeft: '4px solid #7C3AED',
                    margin: '1.5rem 0'
                  }}>
                    <h4 style={{ color: '#7C3AED', marginBottom: '0.5rem', fontSize: '1rem' }}>置信度说明:</h4>
                    <p>
                      我们对本次反推结果的置信度为 <strong style={{ color: item.confidence >= 80 ? '#10b981' : item.confidence >= 60 ? '#f59e0b' : '#ef4444' }}>{item.confidence}%</strong>。
                      {item.confidence >= 80 ? ' 这是一个高置信度结果，提示词和参数非常可靠。' : 
                       item.confidence >= 60 ? ' 这是一个中等置信度结果，提示词和参数具有一定参考价值。' : 
                       ' 这是一个低置信度结果，建议根据实际情况调整提示词和参数。'}
                    </p>
                  </div>
                  
                  <div className="result-info">
                    <div className="result-prompt">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <h3>反推提示词:</h3>
                        <button 
                          style={{ 
                            padding: '0.25rem 0.75rem', 
                            fontSize: '0.8rem',
                            backgroundColor: '#3d3d3d',
                            borderRadius: '0.375rem',
                            border: 'none',
                            color: '#e0e0e0',
                            cursor: 'pointer'
                          }}
                          onClick={() => navigator.clipboard.writeText(item.prompt)}
                        >
                          复制
                        </button>
                      </div>
                      <p style={{ marginBottom: '1rem', lineHeight: '1.7' }}>{item.prompt}</p>
                      
                      {/* 结构化提示词信息 */}
                      {item.structuredPrompt && (
                        <div style={{ 
                          backgroundColor: '#1a1a1a', 
                          padding: '1rem', 
                          borderRadius: '0.5rem',
                          fontSize: '0.9rem',
                          marginBottom: '1rem'
                        }}>
                          <h4 style={{ color: '#7C3AED', marginBottom: '1rem', fontSize: '1rem' }}>结构化提示词:</h4>
                          
                          {/* 基本构成范式 */}
                          {item.structuredPrompt.paradigmContents?.basicStructure && (
                            <div style={{ marginBottom: '1rem' }}>
                              <strong style={{ color: '#7C3AED' }}>基本构成范式:</strong>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
                                <div style={{ backgroundColor: '#2d2d2d', padding: '0.75rem', borderRadius: '0.375rem' }}>
                                  <div style={{ color: '#7C3AED', fontSize: '0.85rem', marginBottom: '0.25rem' }}>单个词语:</div>
                                  <div style={{ color: '#e0e0e0', fontWeight: '500' }}>{item.structuredPrompt.paradigmContents.basicStructure.singleWord}</div>
                                </div>
                                <div style={{ backgroundColor: '#2d2d2d', padding: '0.75rem', borderRadius: '0.375rem' }}>
                                  <div style={{ color: '#7C3AED', fontSize: '0.85rem', marginBottom: '0.25rem' }}>短语提示:</div>
                                  <div style={{ color: '#e0e0e0', fontWeight: '500' }}>{item.structuredPrompt.paradigmContents.basicStructure.phrase}</div>
                                </div>
                                <div style={{ backgroundColor: '#2d2d2d', padding: '0.75rem', borderRadius: '0.375rem' }}>
                                  <div style={{ color: '#7C3AED', fontSize: '0.85rem', marginBottom: '0.25rem' }}>完整句子:</div>
                                  <div style={{ color: '#e0e0e0', fontWeight: '500' }}>{item.structuredPrompt.paradigmContents.basicStructure.completeSentence}</div>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* 应用结构范式 */}
                          <div style={{ marginBottom: '1rem' }}>
                            <strong style={{ color: '#7C3AED' }}>应用结构范式:</strong>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
                              {item.structuredPrompt.paradigmContents?.applicationStructures && Object.entries(item.structuredPrompt.paradigmContents.applicationStructures).map(([type, structure]) => (
                                <div key={type} style={{ backgroundColor: '#2d2d2d', padding: '0.75rem', borderRadius: '0.375rem' }}>
                                  <div style={{ color: '#7C3AED', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                                    {type === 'photography' ? '摄影风格' : type === 'painting' ? '绘画风格' : type === 'film' ? '电影风格' : type === 'text' ? '文案风格' : type}:
                                  </div>
                                  <div style={{ color: '#e0e0e0' }}>{structure}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {/* 功能要素 */}
                          <div style={{ marginBottom: '1rem' }}>
                            <strong style={{ color: '#7C3AED' }}>功能要素:</strong>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
                              <div style={{ backgroundColor: '#2d2d2d', padding: '0.75rem', borderRadius: '0.375rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                  <span style={{ color: '#a0a0a0' }}>主体:</span>
                                  <span style={{ color: '#e0e0e0', fontWeight: '500' }}>{item.structuredPrompt.elements.mainSubject}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                  <span style={{ color: '#a0a0a0' }}>风格:</span>
                                  <span style={{ color: '#e0e0e0', fontWeight: '500' }}>{item.structuredPrompt.elements.style}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                  <span style={{ color: '#a0a0a0' }}>场景/动作:</span>
                                  <span style={{ color: '#e0e0e0', fontWeight: '500' }}>{item.structuredPrompt.elements.sceneAction}</span>
                                </div>
                                {item.structuredPrompt.elements.artistReference && (
                                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#a0a0a0' }}>艺术家/参考:</span>
                                    <span style={{ color: '#e0e0e0', fontWeight: '500' }}>{item.structuredPrompt.elements.artistReference}</span>
                                  </div>
                                )}
                              </div>
                              <div style={{ backgroundColor: '#2d2d2d', padding: '0.75rem', borderRadius: '0.375rem' }}>
                                <div style={{ marginBottom: '0.5rem' }}>
                                  <span style={{ color: '#a0a0a0', display: 'block', marginBottom: '0.25rem' }}>细节修饰:</span>
                                  <span style={{ color: '#e0e0e0', fontWeight: '500' }}>{item.structuredPrompt.elements.details}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* 正向提示词 */}
                          <div style={{ marginBottom: '1rem' }}>
                            <strong style={{ color: '#7C3AED', marginBottom: '0.5rem', display: 'block' }}>正向提示词:</strong>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                              {item.structuredPrompt.elements.positivePrompt.map((prompt, index) => (
                                <span key={index} style={{ 
                                  backgroundColor: '#2d2d2d', 
                                  padding: '0.375rem 0.75rem', 
                                  borderRadius: '9999px', 
                                  fontSize: '0.85rem',
                                  color: '#e0e0e0',
                                  border: '1px solid #3d3d3d'
                                }}>
                                  {prompt}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          {/* 反向提示词 */}
                          <div>
                            <strong style={{ color: '#7C3AED', marginBottom: '0.5rem', display: 'block' }}>反向提示词:</strong>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                              {item.structuredPrompt.elements.negativePrompt.map((prompt, index) => (
                                <span key={index} style={{ 
                                  backgroundColor: '#2d2d2d', 
                                  padding: '0.375rem 0.75rem', 
                                  borderRadius: '9999px', 
                                  fontSize: '0.85rem',
                                  color: '#ef4444',
                                  border: '1px solid #3d3d3d'
                                }}>
                                  {prompt}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div style={{ 
                        backgroundColor: '#1a1a1a', 
                        padding: '1rem', 
                        borderRadius: '0.5rem',
                        fontSize: '0.9rem',
                        color: '#a0a0a0'
                      }}>
                        <h4 style={{ color: '#7C3AED', marginBottom: '0.5rem', fontSize: '1rem' }}>提示词解释:</h4>
                        <p>该提示词基于您上传的{item.type === 'image' ? '图像' : item.type === 'video' ? '视频' : '文档'}内容生成，包含了风格、主题、质量要求和构图建议等关键要素，可直接用于AI生成工具。</p>
                      </div>
                    </div>
                    
                    {item.params && (
                      <div className="result-params">
                        <h3 style={{ marginBottom: '1rem' }}>参数设置:</h3>
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                          gap: '1rem',
                          marginBottom: '1.5rem'
                        }}>
                          {Object.entries(item.params).map(([key, value]) => {
                            // 参数解释
                            const paramExplanations: Record<string, string> = {
                              model: '使用的AI模型',
                              steps: '生成过程中的迭代步数，值越高质量越好但耗时越长',
                              cfg_scale: '提示词遵循度，值越高越严格遵循提示词',
                              resolution: '生成内容的分辨率',
                              aspect_ratio: '宽高比',
                              temperature: '生成内容的随机性，值越高越创意但可能偏离主题',
                              max_tokens: '生成文本的最大长度',
                              top_p: '核采样参数，控制生成的多样性',
                              presence_penalty: '惩罚重复出现的主题',
                              frequency_penalty: '惩罚重复出现的词汇'
                            };
                            
                            return (
                              <div key={key} style={{ 
                                backgroundColor: '#1a1a1a',
                                padding: '1rem',
                                borderRadius: '0.5rem',
                                border: '1px solid #3d3d3d'
                              }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                  <strong style={{ color: '#7C3AED' }}>{key.replace('_', ' ')}:</strong>
                                  <span style={{ color: '#e0e0e0', fontWeight: '500' }}>{value}</span>
                                </div>
                                <p style={{ fontSize: '0.85rem', color: '#a0a0a0', lineHeight: '1.5' }}>
                                  {paramExplanations[key] || '参数说明'}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                    {item.workflow && (
                      <div className="result-params">
                        <h3 style={{ marginBottom: '1rem' }}>处理工作流:</h3>
                        <div style={{ 
                          display: 'flex', 
                          flexWrap: 'wrap', 
                          gap: '0.75rem',
                          marginBottom: '1.5rem'
                        }}>
                          {item.workflow.map((step, index) => (
                            <div key={index} style={{ 
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              backgroundColor: '#1a1a1a',
                              padding: '1rem',
                              borderRadius: '0.75rem',
                              border: '1px solid #3d3d3d',
                              minWidth: '120px'
                            }}>
                              <div style={{ 
                                backgroundColor: '#7C3AED',
                                borderRadius: '50%',
                                width: '30px',
                                height: '30px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '0.9rem',
                                marginBottom: '0.5rem'
                              }}>
                                {index + 1}
                              </div>
                              <span style={{ 
                                color: '#e0e0e0',
                                fontSize: '0.85rem',
                                textAlign: 'center',
                                lineHeight: '1.4'
                              }}>
                                {step}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    

                    
                    {/* 生成成果按钮 */}
                    <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
                      {generating === item.id ? (
                        <div className="loading-container" style={{ backgroundColor: '#1a1a1a', padding: '1.5rem', borderRadius: '0.5rem' }}>
                          <div className="loading-spinner"></div>
                          <div className="loading-text">正在生成成果...</div>
                          <div className="progress-bar" style={{ margin: '1rem 0' }}>
                            <div className="progress-fill" style={{ width: `${generationProgress}%` }}></div>
                          </div>
                          <div style={{ fontSize: '0.9rem', color: '#a0a0a0' }}>
                            {generationProgress}%
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => generateFromPrompt(item.id, item.prompt, item.type)}
                          style={{
                            padding: '0.75rem 1.5rem',
                            fontSize: '1rem',
                            backgroundColor: '#7C3AED',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            fontWeight: '600',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#6d28d9'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#7C3AED'}
                        >
                          🚀 基于此提示词生成新成果
                        </button>
                      )}
                    </div>

                    {/* 生成结果展示 */}
                    {generatedResults[item.id] && (
                      <div style={{ 
                        backgroundColor: '#1a1a1a', 
                        padding: '1.5rem', 
                        borderRadius: '0.75rem',
                        border: '1px solid #3d3d3d',
                        marginTop: '1.5rem'
                      }}>
                        <h3 style={{ color: '#7C3AED', marginBottom: '1rem', fontSize: '1.25rem' }}>
                          🎨 生成成果
                        </h3>
                        
                        <div style={{ marginBottom: '1rem' }}>
                          <strong>生成类型:</strong> {generatedResults[item.id].type === 'image' ? '图像' : '文案'}
                        </div>
                        
                        <div style={{ marginBottom: '1.5rem' }}>
                          {generatedResults[item.id].type === 'image' ? (
                            <img 
                              src={generatedResults[item.id].content} 
                              alt="Generated" 
                              style={{ 
                                width: '100%', 
                                height: 'auto', 
                                borderRadius: '0.5rem',
                                border: '1px solid #3d3d3d'
                              }}
                            />
                          ) : (
                            <div style={{ 
                              backgroundColor: '#2d2d2d', 
                              padding: '1.5rem', 
                              borderRadius: '0.5rem',
                              whiteSpace: 'pre-wrap',
                              lineHeight: '1.7',
                              fontSize: '0.95rem'
                            }}>
                              {generatedResults[item.id].content}
                            </div>
                          )}
                        </div>
                        
                        <div style={{ fontSize: '0.85rem', color: '#a0a0a0' }}>
                          <strong>使用的提示词:</strong> {generatedResults[item.id].prompt}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="app-footer">
        <p>AI 反向工程 © 2026</p>
      </footer>
    </div>
  )
}

// 错误边界组件
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    console.error('ErrorBoundary捕获到错误:', error);
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="app">
          <header className="app-header">
            <h1>AI 反向工程</h1>
          </header>
          <main className="app-main">
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <h2>应用出错了</h2>
              <p>请刷新页面重试</p>
            </div>
          </main>
        </div>
      );
    }

    return this.props.children;
  }
}

// 导出带错误边界的App组件
export default function AppWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}