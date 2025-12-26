import { executeQuery, executeUpdate } from "../config/database.ts";
import { Newspaper, CreateNewspaperDTO, UpdateNewspaperDTO, mapToNewspaper } from "../models/newspaper.ts";

export class NewspaperController {
  // 获取所有报刊
  static async getAll(): Promise<Newspaper[]> {
    try {
      const results = await executeQuery<Newspaper>(
        "SELECT * FROM newspapers ORDER BY created_at DESC"
      );
      return results.map(mapToNewspaper);
    } catch (error) {
      console.error("获取报刊列表失败:", error);
      throw error;
    }
  }

  // 根据ID获取报刊
  static async getById(id: number): Promise<Newspaper | null> {
    try {
      const results = await executeQuery<Newspaper>(
        "SELECT * FROM newspapers WHERE id = ?",
        [id]
      );
      
      if (results.length === 0) {
        return null;
      }
      
      return mapToNewspaper(results[0]);
    } catch (error) {
      console.error(`获取报刊 ${id} 失败:`, error);
      throw error;
    }
  }

  // 创建新报刊
  static async create(newspaperData: CreateNewspaperDTO): Promise<Newspaper> {
    try {
      // 检查报刊名称是否已存在
      const existing = await executeQuery<Newspaper>(
        "SELECT * FROM newspapers WHERE name = ?",
        [newspaperData.name]
      );
      
      if (existing.length > 0) {
        throw new Error("报刊名称已存在");
      }

      const result = await executeUpdate(
        "INSERT INTO newspapers (name, publisher, frequency, price, description) VALUES (?, ?, ?, ?, ?)",
        [
          newspaperData.name,
          newspaperData.publisher,
          newspaperData.frequency,
          newspaperData.price,
          newspaperData.description || null,
        ]
      );

      if (!result.insertId) {
        throw new Error("创建报刊失败");
      }

      const newNewspaper = await this.getById(result.insertId);
      if (!newNewspaper) {
        throw new Error("创建报刊后获取数据失败");
      }

      return newNewspaper;
    } catch (error) {
      console.error("创建报刊失败:", error);
      throw error;
    }
  }

  // 更新报刊
  static async update(id: number, newspaperData: UpdateNewspaperDTO): Promise<Newspaper | null> {
    try {
      // 检查报刊是否存在
      const existing = await this.getById(id);
      if (!existing) {
        return null;
      }

      // 如果更新名称，检查是否与其他报刊冲突
      if (newspaperData.name && newspaperData.name !== existing.name) {
        const nameExists = await executeQuery<Newspaper>(
          "SELECT * FROM newspapers WHERE name = ? AND id != ?",
          [newspaperData.name, id]
        );
        
        if (nameExists.length > 0) {
          throw new Error("报刊名称已被其他报刊使用");
        }
      }

      const updateFields: string[] = [];
      const updateValues: any[] = [];

      if (newspaperData.name !== undefined) {
        updateFields.push("name = ?");
        updateValues.push(newspaperData.name);
      }
      
      if (newspaperData.publisher !== undefined) {
        updateFields.push("publisher = ?");
        updateValues.push(newspaperData.publisher);
      }
      
      if (newspaperData.frequency !== undefined) {
        updateFields.push("frequency = ?");
        updateValues.push(newspaperData.frequency);
      }
      
      if (newspaperData.price !== undefined) {
        updateFields.push("price = ?");
        updateValues.push(newspaperData.price);
      }
      
      if (newspaperData.description !== undefined) {
        updateFields.push("description = ?");
        updateValues.push(newspaperData.description);
      }

      if (updateFields.length === 0) {
        return existing;
      }

      updateValues.push(id);

      const sql = `UPDATE newspapers SET ${updateFields.join(", ")} WHERE id = ?`;
      await executeUpdate(sql, updateValues);

      return await this.getById(id);
    } catch (error) {
      console.error(`更新报刊 ${id} 失败:`, error);
      throw error;
    }
  }

  // 删除报刊
  static async delete(id: number): Promise<boolean> {
    try {
      // 检查报刊是否存在
      const existing = await this.getById(id);
      if (!existing) {
        return false;
      }

      // 检查是否有订阅关联
      const subscriptions = await executeQuery<{ count: number }>(
        "SELECT COUNT(*) as count FROM subscriptions WHERE newspaper_id = ?",
        [id]
      );
      
      if (subscriptions[0]?.count > 0) {
        throw new Error("该报刊有关联的订阅，无法删除");
      }

      const result = await executeUpdate(
        "DELETE FROM newspapers WHERE id = ?",
        [id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error(`删除报刊 ${id} 失败:`, error);
      throw error;
    }
  }

  // 搜索报刊
  static async search(keyword: string): Promise<Newspaper[]> {
    try {
      const searchTerm = `%${keyword}%`;
      const results = await executeQuery<Newspaper>(
        "SELECT * FROM newspapers WHERE name LIKE ? OR publisher LIKE ? OR description LIKE ? ORDER BY created_at DESC",
        [searchTerm, searchTerm, searchTerm]
      );
      
      return results.map(mapToNewspaper);
    } catch (error) {
      console.error("搜索报刊失败:", error);
      throw error;
    }
  }

  // 获取报刊统计
  static async getStats() {
    try {
      const [totalResult, priceStats] = await Promise.all([
        executeQuery<{ count: number }>("SELECT COUNT(*) as count FROM newspapers"),
        executeQuery<{ avg_price: number, max_price: number, min_price: number }>(
          "SELECT AVG(price) as avg_price, MAX(price) as max_price, MIN(price) as min_price FROM newspapers"
        ),
      ]);

      return {
        total: totalResult[0]?.count || 0,
        avgPrice: priceStats[0]?.avg_price || 0,
        maxPrice: priceStats[0]?.max_price || 0,
        minPrice: priceStats[0]?.min_price || 0,
      };
    } catch (error) {
      console.error("获取报刊统计失败:", error);
      throw error;
    }
  }

  // 按价格范围查询报刊
  static async getByPriceRange(minPrice: number, maxPrice: number): Promise<Newspaper[]> {
    try {
      const results = await executeQuery<Newspaper>(
        "SELECT * FROM newspapers WHERE price BETWEEN ? AND ? ORDER BY price ASC",
        [minPrice, maxPrice]
      );
      
      return results.map(mapToNewspaper);
    } catch (error) {
      console.error("按价格范围查询报刊失败:", error);
      throw error;
    }
  }

  // 按出版社查询报刊
  static async getByPublisher(publisher: string): Promise<Newspaper[]> {
    try {
      const results = await executeQuery<Newspaper>(
        "SELECT * FROM newspapers WHERE publisher = ? ORDER BY name ASC",
        [publisher]
      );
      
      return results.map(mapToNewspaper);
    } catch (error) {
      console.error("按出版社查询报刊失败:", error);
      throw error;
    }
  }
}
