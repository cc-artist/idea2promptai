import { UserRecord } from '../types';

// 记录管理服务
class RecordManagementService {
  // 获取所有记录
  async getRecords(): Promise<UserRecord[]> {
    try {
      // 简化处理，实际项目中应调用真实API
      return [];
    } catch (error) {
      console.error('获取记录失败:', error);
      return [];
    }
  }

  // 添加记录（通过API自动添加，前端不需要手动添加）
  async addRecord(_record: Omit<UserRecord, 'id' | 'timestamp'>): Promise<UserRecord> {
    // 记录由后端自动创建，前端不需要手动添加
    throw new Error('记录由后端自动创建，前端不需要手动添加');
  }

  // 删除记录
  async deleteRecord(_id: string): Promise<void> {
    try {
      // 简化处理，实际项目中应调用真实API
    } catch (error) {
      console.error('删除记录失败:', error);
      throw new Error('删除记录失败');
    }
  }

  // 清空所有记录
  async clearRecords(): Promise<void> {
    try {
      // 简化处理，实际项目中应调用真实API
    } catch (error) {
      console.error('清空记录失败:', error);
      throw new Error('清空记录失败');
    }
  }

  // 获取记录数量
  async getRecordCount(): Promise<number> {
    try {
      const records = await this.getRecords();
      return records.length;
    } catch (error) {
      console.error('获取记录数量失败:', error);
      return 0;
    }
  }
}

// 导出单例实例
export const recordManagementService = new RecordManagementService();
