import { ReversePromptResult, GenerateResult } from '../types';

// 缓存项接口
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // 过期时间（毫秒）
}

// 缓存类
class CacheService {
  private cache: Map<string, CacheItem<any>> = new Map();
  private defaultTTL = 24 * 60 * 60 * 1000; // 默认24小时过期

  // 生成缓存键
  private generateKey(prefix: string, ...args: any[]): string {
    const strArgs = args.map(arg => {
      if (typeof arg === 'object') {
        return JSON.stringify(arg);
      }
      return String(arg);
    });
    return `${prefix}:${strArgs.join(':')}`;
  }

  // 设置缓存
  set<T>(key: string, data: T, ttl?: number): void {
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    };
    this.cache.set(key, cacheItem);
    // 限制缓存大小，最多1000项
    if (this.cache.size > 1000) {
      // 移除最旧的缓存项
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      }
    }
  }

  // 获取缓存
  get<T>(key: string): T | null {
    const cacheItem = this.cache.get(key);
    if (!cacheItem) return null;

    // 检查是否过期
    if (Date.now() > cacheItem.timestamp + cacheItem.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cacheItem.data;
  }

  // 删除缓存
  delete(key: string): void {
    this.cache.delete(key);
  }

  // 清空缓存
  clear(): void {
    this.cache.clear();
  }

  // 获取缓存大小
  getSize(): number {
    return this.cache.size;
  }

  // 缓存反推结果
  cacheReverseResult(type: 'image' | 'video' | 'text', contentHash: string, result: ReversePromptResult): void {
    const key = this.generateKey('reverse', type, contentHash);
    this.set(key, result);
  }

  // 获取反推结果缓存
  getReverseResult(type: 'image' | 'video' | 'text', contentHash: string): ReversePromptResult | null {
    const key = this.generateKey('reverse', type, contentHash);
    return this.get(key);
  }

  // 缓存生成结果
  cacheGenerateResult(prompt: string, type: 'image' | 'text', params: any, result: GenerateResult): void {
    const key = this.generateKey('generate', type, prompt, params);
    this.set(key, result);
  }

  // 获取生成结果缓存
  getGenerateResult(prompt: string, type: 'image' | 'text', params: any): GenerateResult | null {
    const key = this.generateKey('generate', type, prompt, params);
    return this.get(key);
  }

  // 计算内容哈希（简化版，实际项目中应使用更安全的哈希算法）
  computeContentHash(content: string | File): string {
    if (content instanceof File) {
      // 对于文件，使用文件名+大小+最后修改时间作为哈希
      return `${content.name}:${content.size}:${content.lastModified}`;
    }
    // 对于字符串，使用简单的哈希算法
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }
}

// 导出单例实例
export const cacheService = new CacheService();
