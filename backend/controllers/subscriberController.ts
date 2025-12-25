import { executeQuery, executeUpdate } from "../config/database.ts";
import { Subscriber, CreateSubscriberDTO, UpdateSubscriberDTO, mapToSubscriber } from "../models/subscriber.ts";

export class SubscriberController {
  // 获取所有订户
  static async getAll(): Promise<Subscriber[]> {
    try {
      const results = await executeQuery<Subscriber>(
        "SELECT * FROM subscribers ORDER BY created_at DESC"
      );
      return results.map(mapToSubscriber);
    } catch (error) {
      console.error("获取订户列表失败:", error);
      throw error;
    }
  }

  // 根据ID获取订户
  static async getById(id: number): Promise<Subscriber | null> {
    try {
      const results = await executeQuery<Subscriber>(
        "SELECT * FROM subscribers WHERE id = ?",
        [id]
      );
      
      if (results.length === 0) {
        return null;
      }
      
      return mapToSubscriber(results[0]);
    } catch (error) {
      console.error(`获取订户 ${id} 失败:`, error);
      throw error;
    }
  }

  // 创建新订户
  static async create(subscriberData: CreateSubscriberDTO): Promise<Subscriber> {
    try {
      // 检查邮箱是否已存在
      const existing = await executeQuery<Subscriber>(
        "SELECT * FROM subscribers WHERE email = ?",
        [subscriberData.email]
      );
      
      if (existing.length > 0) {
        throw new Error("邮箱已存在");
      }

      const result = await executeUpdate(
        "INSERT INTO subscribers (name, email, phone, address) VALUES (?, ?, ?, ?)",
        [
          subscriberData.name,
          subscriberData.email,
          subscriberData.phone,
          subscriberData.address,
        ]
      );

      if (!result.insertId) {
        throw new Error("创建订户失败");
      }

      const newSubscriber = await this.getById(result.insertId);
      if (!newSubscriber) {
        throw new Error("创建订户后获取数据失败");
      }

      return newSubscriber;
    } catch (error) {
      console.error("创建订户失败:", error);
      throw error;
    }
  }

  // 更新订户
  static async update(id: number, subscriberData: UpdateSubscriberDTO): Promise<Subscriber | null> {
    try {
      // 检查订户是否存在
      const existing = await this.getById(id);
      if (!existing) {
        return null;
      }

      // 如果更新邮箱，检查是否与其他订户冲突
      if (subscriberData.email && subscriberData.email !== existing.email) {
        const emailExists = await executeQuery<Subscriber>(
          "SELECT * FROM subscribers WHERE email = ? AND id != ?",
          [subscriberData.email, id]
        );
        
        if (emailExists.length > 0) {
          throw new Error("邮箱已被其他订户使用");
        }
      }

      const updateFields: string[] = [];
      const updateValues: any[] = [];

      if (subscriberData.name !== undefined) {
        updateFields.push("name = ?");
        updateValues.push(subscriberData.name);
      }
      
      if (subscriberData.email !== undefined) {
        updateFields.push("email = ?");
        updateValues.push(subscriberData.email);
      }
      
      if (subscriberData.phone !== undefined) {
        updateFields.push("phone = ?");
        updateValues.push(subscriberData.phone);
      }
      
      if (subscriberData.address !== undefined) {
        updateFields.push("address = ?");
        updateValues.push(subscriberData.address);
      }

      if (updateFields.length === 0) {
        return existing;
      }

      updateValues.push(id);

      const sql = `UPDATE subscribers SET ${updateFields.join(", ")} WHERE id = ?`;
      await executeUpdate(sql, updateValues);

      return await this.getById(id);
    } catch (error) {
      console.error(`更新订户 ${id} 失败:`, error);
      throw error;
    }
  }

  // 删除订户
  static async delete(id: number): Promise<boolean> {
    try {
      // 检查订户是否存在
      const existing = await this.getById(id);
      if (!existing) {
        return false;
      }

      const result = await executeUpdate(
        "DELETE FROM subscribers WHERE id = ?",
        [id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error(`删除订户 ${id} 失败:`, error);
      throw error;
    }
  }

  // 搜索订户
  static async search(keyword: string): Promise<Subscriber[]> {
    try {
      const searchTerm = `%${keyword}%`;
      const results = await executeQuery<Subscriber>(
        "SELECT * FROM subscribers WHERE name LIKE ? OR email LIKE ? OR phone LIKE ? ORDER BY created_at DESC",
        [searchTerm, searchTerm, searchTerm]
      );
      
      return results.map(mapToSubscriber);
    } catch (error) {
      console.error("搜索订户失败:", error);
      throw error;
    }
  }

  // 获取订户统计
  static async getStats() {
    try {
      const [totalResult, recentResult] = await Promise.all([
        executeQuery<{ count: number }>("SELECT COUNT(*) as count FROM subscribers"),
        executeQuery<{ count: number }>(
          "SELECT COUNT(*) as count FROM subscribers WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)"
        ),
      ]);

      return {
        total: totalResult[0]?.count || 0,
        recent: recentResult[0]?.count || 0,
      };
    } catch (error) {
      console.error("获取订户统计失败:", error);
      throw error;
    }
  }
}
