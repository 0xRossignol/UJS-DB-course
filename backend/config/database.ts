// 使用动态导入避免类型问题
import { config } from "./env.ts";

// 创建数据库连接池
let pool: any;

// 类型定义
interface QueryResult {
  affectedRows?: number;
  insertId?: number;
  [key: string]: any;
}

// 初始化数据库连接
async function initPool() {
  if (!pool) {
    const mysql = await import("mysql2");
    pool = mysql.createPool({
      host: config.database.host,
      port: config.database.port,
      user: config.database.user,
      password: config.database.password,
      database: config.database.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });
  }
  return pool;
}

// 初始化数据库表
export async function initDatabase() {
  try {
    await initPool();
    // 测试连接
    await executeQuery("SELECT 1");
    console.log("数据库连接测试成功");
    
    // 检查表是否存在，如果不存在则创建
    await checkAndCreateTables();
    
    return true;
  } catch (error) {
    console.error("数据库初始化失败:", error);
    throw error;
  }
}

// 检查并创建表
async function checkAndCreateTables() {
  const tables = ["subscribers", "newspapers", "subscriptions"];
  
  for (const table of tables) {
    try {
      await executeQuery(`SELECT 1 FROM ${table} LIMIT 1`);
      console.log(`表 ${table} 已存在`);
    } catch (error: any) {
      if (error.code === "ER_NO_SUCH_TABLE") {
        console.log(`表 ${table} 不存在，将在首次查询时自动创建`);
      } else {
        console.error(`检查表 ${table} 失败:`, error);
      }
    }
  }
}

// 执行查询
export async function executeQuery<T = any>(sql: string, params?: any[]): Promise<T[]> {
  const dbPool = await initPool();
  return new Promise((resolve, reject) => {
    dbPool.query(sql, params, (error: Error | null, results: any) => {
      if (error) {
        console.error("数据库查询错误:", error);
        reject(error);
      } else {
        // 将RowDataPacket转换为普通对象
        const plainResults = JSON.parse(JSON.stringify(results));
        resolve(plainResults);
      }
    });
  });
}

// 执行更新
export async function executeUpdate(sql: string, params?: any[]): Promise<{ affectedRows: number, insertId?: number }> {
  const dbPool = await initPool();
  return new Promise((resolve, reject) => {
    dbPool.query(sql, params, (error: Error | null, results: QueryResult) => {
      if (error) {
        console.error("数据库更新错误:", error);
        reject(error);
      } else {
        resolve({
          affectedRows: results.affectedRows || 0,
          insertId: results.insertId,
        });
      }
    });
  });
}

// 关闭数据库连接
export async function closeDatabase() {
  if (pool) {
    return new Promise<void>((resolve, reject) => {
      pool.end((error: any) => {
        if (error) {
          console.error("关闭数据库连接失败:", error);
          reject(error);
        } else {
          console.log("数据库连接已关闭");
          pool = null;
          resolve();
        }
      });
    });
  }
  return Promise.resolve();
}
