import { Application, Router } from "@oak/oak";
import { config } from "./config/env.ts";
import { initDatabase, executeQuery } from "./config/database.ts";
import { router as subscriberRoutes } from "./routes/subscriberRoutes.ts";

const app = new Application();
const router = new Router();

// 初始化数据库连接
let dbInitialized = false;

try {
  await initDatabase();
  dbInitialized = true;
  console.log("数据库连接成功");
} catch (error) {
  console.error("数据库连接失败:", error);
  console.log("使用模拟数据模式");
}

// 简单的健康检查路由
router.get("/api/health", (ctx) => {
  ctx.response.body = { 
    status: "ok", 
    message: "服务器运行正常", 
    mode: dbInitialized ? "数据库模式" : "模拟数据模式",
    dbConnected: dbInitialized
  };
});

// 获取订户列表
router.get("/api/subscribers", async (ctx) => {
  try {
    if (!dbInitialized) {
      ctx.response.body = {
        success: true,
        data: [],
        message: "数据库未连接，返回空数据",
        mode: "模拟数据模式"
      };
      return;
    }

    const subscribers = await executeQuery("SELECT * FROM subscribers ORDER BY created_at DESC");
    
    ctx.response.body = {
      success: true,
      data: subscribers,
      message: "获取订户列表成功",
      mode: "数据库模式"
    };
  } catch (error: any) {
    console.error("获取订户列表失败:", error);
    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      data: [],
      message: "获取订户列表失败",
      error: error.message
    };
  }
});

// 获取报刊列表
router.get("/api/newspapers", async (ctx) => {
  try {
    if (!dbInitialized) {
      ctx.response.body = {
        success: true,
        data: [],
        message: "数据库未连接，返回空数据",
        mode: "模拟数据模式"
      };
      return;
    }

    const newspapers = await executeQuery("SELECT * FROM newspapers ORDER BY created_at DESC");
    
    ctx.response.body = {
      success: true,
      data: newspapers,
      message: "获取报刊列表成功",
      mode: "数据库模式"
    };
  } catch (error: any) {
    console.error("获取报刊列表失败:", error);
    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      data: [],
      message: "获取报刊列表失败",
      error: error.message
    };
  }
});

// 获取订阅列表
router.get("/api/subscriptions", async (ctx) => {
  try {
    if (!dbInitialized) {
      ctx.response.body = {
        success: true,
        data: [],
        message: "数据库未连接，返回空数据",
        mode: "模拟数据模式"
      };
      return;
    }

    const subscriptions = await executeQuery(`
      SELECT s.*, 
             sub.name as subscriber_name, 
             sub.email as subscriber_email,
             n.name as newspaper_name,
             n.publisher,
             n.price
      FROM subscriptions s
      LEFT JOIN subscribers sub ON s.subscriber_id = sub.id
      LEFT JOIN newspapers n ON s.newspaper_id = n.id
      ORDER BY s.created_at DESC
    `);
    
    ctx.response.body = {
      success: true,
      data: subscriptions,
      message: "获取订阅列表成功",
      mode: "数据库模式"
    };
  } catch (error: any) {
    console.error("获取订阅列表失败:", error);
    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      data: [],
      message: "获取订阅列表失败",
      error: error.message
    };
  }
});

// 使用订户路由
router.use("/api", subscriberRoutes.routes());

// CORS中间件
app.use(async (ctx, next) => {
  ctx.response.headers.set("Access-Control-Allow-Origin", config.server.corsOrigin);
  ctx.response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  ctx.response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  
  if (ctx.request.method === "OPTIONS") {
    ctx.response.status = 200;
    return;
  }
  
  await next();
});

// 使用路由
app.use(router.routes());
app.use(router.allowedMethods());

// 错误处理中间件
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (error: any) {
    console.error("服务器错误:", error);
    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      message: "服务器内部错误",
      error: error.message
    };
  }
});

// 404处理
app.use((ctx) => {
  ctx.response.status = 404;
  ctx.response.body = {
    success: false,
    message: "请求的资源不存在"
  };
});

console.log(`服务器启动在 http://localhost:${config.server.port}`);
await app.listen({ port: config.server.port });
