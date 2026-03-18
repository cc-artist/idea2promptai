// 套餐类型
export enum SubscriptionPlan {
  FREE = 'free',
  BASIC = 'basic',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise',
}

// 套餐信息接口
export interface PlanInfo {
  name: string;
  monthlyPrice: number;
  monthlyUsageLimit: number;
  features: string[];
}

// 使用量接口
export interface UsageInfo {
  totalUsed: number;
  imageUsed: number;
  videoUsed: number;
  textUsed: number;
  resetDate: Date;
}

// 计费服务类
class BillingService {
  // 套餐配置（实际项目中应从API获取）
  private plans: Record<SubscriptionPlan, PlanInfo> = {
    [SubscriptionPlan.FREE]: {
      name: '免费版',
      monthlyPrice: 0,
      monthlyUsageLimit: 5,
      features: [
        '每月5次免费反推',
        '基础反推功能',
        '生成结果有水印',
      ],
    },
    [SubscriptionPlan.BASIC]: {
      name: '基础版',
      monthlyPrice: 9.9,
      monthlyUsageLimit: 30,
      features: [
        '每月30次反推',
        '高清反推结果',
        '生成结果无水印',
        '优先处理',
      ],
    },
    [SubscriptionPlan.PROFESSIONAL]: {
      name: '专业版',
      monthlyPrice: 29.9,
      monthlyUsageLimit: 100,
      features: [
        '每月100次反推',
        '高清反推结果',
        '生成结果无水印',
        '优先处理',
        '批量处理',
        'API访问',
      ],
    },
    [SubscriptionPlan.ENTERPRISE]: {
      name: '企业版',
      monthlyPrice: 0, // 定制化价格
      monthlyUsageLimit: -1, // 无限制
      features: [
        '无限制反推次数',
        '高清反推结果',
        '生成结果无水印',
        '专属客服',
        '定制化功能',
        'API访问',
      ],
    },
  };

  // 获取当前套餐
  async getCurrentPlan(): Promise<SubscriptionPlan> {
    try {
      await import('./api').then(m => m.default.billing.getBillingInfo());
      return SubscriptionPlan.FREE; // 简化处理，实际项目中应从API返回值获取
    } catch (error) {
      console.error('获取当前套餐失败:', error);
      return SubscriptionPlan.FREE;
    }
  }

  // 获取套餐信息
  getPlanInfo(plan: SubscriptionPlan): PlanInfo {
    return this.plans[plan];
  }

  // 获取所有套餐
  getAllPlans(): Record<SubscriptionPlan, PlanInfo> {
    return this.plans;
  }

  // 获取使用量
  async getUsageInfo(): Promise<UsageInfo> {
    try {
      await import('./api').then(m => m.default.billing.getBillingInfo());
      return {
        totalUsed: 0,
        imageUsed: 0,
        videoUsed: 0,
        textUsed: 0,
        resetDate: new Date(),
      };
    } catch (error) {
      console.error('获取使用量失败:', error);
      // 返回默认使用量
      return {
        totalUsed: 0,
        imageUsed: 0,
        videoUsed: 0,
        textUsed: 0,
        resetDate: new Date(),
      };
    }
  }

  // 更新使用量
  async updateUsage(_type: 'image' | 'video' | 'text'): Promise<boolean> {
    try {
      // 简化处理，实际项目中应调用真实API
      return true;
    } catch (error) {
      console.error('更新使用量失败:', error);
      return true; // 出错时默认允许继续使用
    }
  }

  // 获取剩余使用次数
  async getRemainingUsage(): Promise<number> {
    try {
      const usage = await this.getUsageInfo();
      const currentPlan = await this.getCurrentPlan();
      const planInfo = this.getPlanInfo(currentPlan);
      
      if (planInfo.monthlyUsageLimit <= 0) {
        return Infinity; // 无限制
      }
      
      return Math.max(0, planInfo.monthlyUsageLimit - usage.totalUsed);
    } catch (error) {
      console.error('获取剩余使用次数失败:', error);
      return 0;
    }
  }
}

// 导出单例实例
export const billingService = new BillingService();
