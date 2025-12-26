import { executeQuery, executeUpdate } from "../config/database.ts";
import { Subscription, CreateSubscriptionDTO, UpdateSubscriptionDTO, mapToSubscription } from "../models/subscription.ts";

export class SubscriptionController {
  // 获取所有订阅
  static async getAll(): Promise<Subscription[]> {
    try {
      const results = await executeQuery<Subscription>(
        `SELECT s.*, 
                sub.name as subscriber_name, sub.email as subscriber_email,
                n.name as newspaper_name, n.publisher, n.price as newspaper_price
         FROM subscriptions s
         JOIN subscribers sub ON s.subscriber_id = sub.id
         JOIN newspapers n ON s.newspaper_id = n.id
         ORDER BY s.created_at DESC`
      );
      return results.map(mapToSubscription);
    } catch (error) {
      console.error("获取订阅列表失败:", error);
      throw error;
    }
  }

  // 根据ID获取订阅
  static async getById(id: number): Promise<Subscription | null> {
    try {
      const results = await executeQuery<Subscription>(
        `SELECT s.*, 
                sub.name as subscriber_name, sub.email as subscriber_email,
                n.name as newspaper_name, n.publisher, n.price as newspaper_price
         FROM subscriptions s
         JOIN subscribers sub ON s.subscriber_id = sub.id
         JOIN newspapers n ON s.newspaper_id = n.id
         WHERE s.id = ?`,
        [id]
      );
      
      if (results.length === 0) {
        return null;
      }
      
      return mapToSubscription(results[0]);
    } catch (error) {
      console.error(`获取订阅 ${id} 失败:`, error);
      throw error;
    }
  }

  // 创建新订阅
  static async create(subscriptionData: CreateSubscriptionDTO): Promise<Subscription> {
    try {
      // 检查订户是否存在
      const subscriberExists = await executeQuery<{ id: number }>(
        "SELECT id FROM subscribers WHERE id = ?",
        [subscriptionData.subscriber_id]
      );
      
      if (subscriberExists.length === 0) {
        throw new Error("订户不存在");
      }

      // 检查报刊是否存在
      const newspaperExists = await executeQuery<{ id: number }>(
        "SELECT id FROM newspapers WHERE id = ?",
        [subscriptionData.newspaper_id]
      );
      
      if (newspaperExists.length === 0) {
        throw new Error("报刊不存在");
      }

      // 检查是否已存在相同订阅
      const existingSubscription = await executeQuery<Subscription>(
        "SELECT * FROM subscriptions WHERE subscriber_id = ? AND newspaper_id = ? AND status = 'active'",
        [subscriptionData.subscriber_id, subscriptionData.newspaper_id]
      );
      
      if (existingSubscription.length > 0) {
        throw new Error("该订户已订阅此报刊");
      }

      const result = await executeUpdate(
        "INSERT INTO subscriptions (subscriber_id, newspaper_id, start_date, end_date, status) VALUES (?, ?, ?, ?, ?)",
        [
          subscriptionData.subscriber_id,
          subscriptionData.newspaper_id,
          subscriptionData.start_date,
          subscriptionData.end_date,
          subscriptionData.status || 'active',
        ]
      );

      if (!result.insertId) {
        throw new Error("创建订阅失败");
      }

      const newSubscription = await this.getById(result.insertId);
      if (!newSubscription) {
        throw new Error("创建订阅后获取数据失败");
      }

      return newSubscription;
    } catch (error) {
      console.error("创建订阅失败:", error);
      throw error;
    }
  }

  // 更新订阅
  static async update(id: number, subscriptionData: UpdateSubscriptionDTO): Promise<Subscription | null> {
    try {
      // 检查订阅是否存在
      const existing = await this.getById(id);
      if (!existing) {
        return null;
      }

      const updateFields: string[] = [];
      const updateValues: any[] = [];

      if (subscriptionData.subscriber_id !== undefined) {
        // 检查新订户是否存在
        const subscriberExists = await executeQuery<{ id: number }>(
          "SELECT id FROM subscribers WHERE id = ?",
          [subscriptionData.subscriber_id]
        );
        
        if (subscriberExists.length === 0) {
          throw new Error("订户不存在");
        }
        updateFields.push("subscriber_id = ?");
        updateValues.push(subscriptionData.subscriber_id);
      }
      
      if (subscriptionData.newspaper_id !== undefined) {
        // 检查新报刊是否存在
        const newspaperExists = await executeQuery<{ id: number }>(
          "SELECT id FROM newspapers WHERE id = ?",
          [subscriptionData.newspaper_id]
        );
        
        if (newspaperExists.length === 0) {
          throw new Error("报刊不存在");
        }
        updateFields.push("newspaper_id = ?");
        updateValues.push(subscriptionData.newspaper_id);
      }
      
      if (subscriptionData.start_date !== undefined) {
        updateFields.push("start_date = ?");
        updateValues.push(subscriptionData.start_date);
      }
      
      if (subscriptionData.end_date !== undefined) {
        updateFields.push("end_date = ?");
        updateValues.push(subscriptionData.end_date);
      }
      
      if (subscriptionData.status !== undefined) {
        updateFields.push("status = ?");
        updateValues.push(subscriptionData.status);
      }

      if (updateFields.length === 0) {
        return existing;
      }

      updateValues.push(id);

      const sql = `UPDATE subscriptions SET ${updateFields.join(", ")} WHERE id = ?`;
      await executeUpdate(sql, updateValues);

      return await this.getById(id);
    } catch (error) {
      console.error(`更新订阅 ${id} 失败:`, error);
      throw error;
    }
  }

  // 删除订阅
  static async delete(id: number): Promise<boolean> {
    try {
      // 检查订阅是否存在
      const existing = await this.getById(id);
      if (!existing) {
        return false;
      }

      const result = await executeUpdate(
        "DELETE FROM subscriptions WHERE id = ?",
        [id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error(`删除订阅 ${id} 失败:`, error);
      throw error;
    }
  }

  // 搜索订阅
  static async search(keyword: string): Promise<Subscription[]> {
    try {
      const searchTerm = `%${keyword}%`;
      const results = await executeQuery<Subscription>(
        `SELECT s.*, 
                sub.name as subscriber_name, sub.email as subscriber_email,
                n.name as newspaper_name, n.publisher, n.price as newspaper_price
         FROM subscriptions s
         JOIN subscribers sub ON s.subscriber_id = sub.id
         JOIN newspapers n ON s.newspaper_id = n.id
         WHERE sub.name LIKE ? OR sub.email LIKE ? OR n.name LIKE ? OR n.publisher LIKE ?
         ORDER BY s.created_at DESC`,
        [searchTerm, searchTerm, searchTerm, searchTerm]
      );
      
      return results.map(mapToSubscription);
    } catch (error) {
      console.error("搜索订阅失败:", error);
      throw error;
    }
  }

  // 获取订阅统计
  static async getStats() {
    try {
      const [totalResult, activeResult, expiredResult, recentResult] = await Promise.all([
        executeQuery<{ count: number }>("SELECT COUNT(*) as count FROM subscriptions"),
        executeQuery<{ count: number }>("SELECT COUNT(*) as count FROM subscriptions WHERE status = 'active'"),
        executeQuery<{ count: number }>("SELECT COUNT(*) as count FROM subscriptions WHERE status = 'expired'"),
        executeQuery<{ count: number }>(
          "SELECT COUNT(*) as count FROM subscriptions WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)"
        ),
      ]);

      return {
        total: totalResult[0]?.count || 0,
        active: activeResult[0]?.count || 0,
        expired: expiredResult[0]?.count || 0,
        recent: recentResult[0]?.count || 0,
      };
    } catch (error) {
      console.error("获取订阅统计失败:", error);
      throw error;
    }
  }

  // 按订户ID查询订阅
  static async getBySubscriberId(subscriberId: number): Promise<Subscription[]> {
    try {
      const results = await executeQuery<Subscription>(
        `SELECT s.*, 
                sub.name as subscriber_name, sub.email as subscriber_email,
                n.name as newspaper_name, n.publisher, n.price as newspaper_price
         FROM subscriptions s
         JOIN subscribers sub ON s.subscriber_id = sub.id
         JOIN newspapers n ON s.newspaper_id = n.id
         WHERE s.subscriber_id = ?
         ORDER BY s.start_date DESC`,
        [subscriberId]
      );
      
      return results.map(mapToSubscription);
    } catch (error) {
      console.error("按订户ID查询订阅失败:", error);
      throw error;
    }
  }

  // 按报刊ID查询订阅
  static async getByNewspaperId(newspaperId: number): Promise<Subscription[]> {
    try {
      const results = await executeQuery<Subscription>(
        `SELECT s.*, 
                sub.name as subscriber_name, sub.email as subscriber_email,
                n.name as newspaper_name, n.publisher, n.price as newspaper_price
         FROM subscriptions s
         JOIN subscribers sub ON s.subscriber_id = sub.id
         JOIN newspapers n ON s.newspaper_id = n.id
         WHERE s.newspaper_id = ?
         ORDER BY s.start_date DESC`,
        [newspaperId]
      );
      
      return results.map(mapToSubscription);
    } catch (error) {
      console.error("按报刊ID查询订阅失败:", error);
      throw error;
    }
  }

  // 按状态查询订阅
  static async getByStatus(status: string): Promise<Subscription[]> {
    try {
      const results = await executeQuery<Subscription>(
        `SELECT s.*, 
                sub.name as subscriber_name, sub.email as subscriber_email,
                n.name as newspaper_name, n.publisher, n.price as newspaper_price
         FROM subscriptions s
         JOIN subscribers sub ON s.subscriber_id = sub.id
         JOIN newspapers n ON s.newspaper_id = n.id
         WHERE s.status = ?
         ORDER BY s.start_date DESC`,
        [status]
      );
      
      return results.map(mapToSubscription);
    } catch (error) {
      console.error("按状态查询订阅失败:", error);
      throw error;
    }
  }

  // 查询即将过期的订阅（30天内）
  static async getExpiringSoon(days: number = 30): Promise<Subscription[]> {
    try {
      const results = await executeQuery<Subscription>(
        `SELECT s.*, 
                sub.name as subscriber_name, sub.email as subscriber_email,
                n.name as newspaper_name, n.publisher, n.price as newspaper_price,
                DATEDIFF(s.end_date, CURDATE()) as days_remaining
         FROM subscriptions s
         JOIN subscribers sub ON s.subscriber_id = sub.id
         JOIN newspapers n ON s.newspaper_id = n.id
         WHERE s.status = 'active' 
           AND s.end_date >= CURDATE() 
           AND s.end_date <= DATE_ADD(CURDATE(), INTERVAL ? DAY)
         ORDER BY s.end_date ASC`,
        [days]
      );
      
      return results.map(mapToSubscription);
    } catch (error) {
      console.error("查询即将过期订阅失败:", error);
      throw error;
    }
  }

  // 更新过期订阅状态
  static async updateExpiredSubscriptions(): Promise<number> {
    try {
      const result = await executeUpdate(
        `UPDATE subscriptions 
         SET status = 'expired', updated_at = NOW()
         WHERE status = 'active' AND end_date < CURDATE()`
      );
      
      console.log(`更新了 ${result.affectedRows} 个过期订阅`);
      return result.affectedRows;
    } catch (error) {
      console.error("更新过期订阅状态失败:", error);
      throw error;
    }
  }
}
