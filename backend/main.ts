import { Application, Router } from "@oak/oak";
import { config } from "./config/env.ts";
import { initDatabase, executeQuery } from "./config/database.ts";
import { router as subscriberRoutes } from "./routes/subscriberRoutes.ts";
import { router as newspaperRoutes } from "./routes/newspaperRoutes.ts";
import { router as subscriptionRoutes } from "./routes/subscriptionRoutes.ts";

const app = new Application();
const router = new Router();

// 初始化数据库连接
let dbInitialized = false;

try {
  await initDatabase();
  dbInitialized = true;
  console.log("数据库连接成功");
  
  // 启动时更新过期订阅状态
  try {
    const { SubscriptionController } = await import("./controllers/subscriptionController.ts");
    const updatedCount = await SubscriptionController.updateExpiredSubscriptions();
    if (updatedCount > 0) {
      console.log(`系统启动时更新了 ${updatedCount} 个过期订阅`);
    }
  } catch (error) {
    console.error("启动时更新过期订阅失败:", error);
  }
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


// 使用订户路由
router.use("/api", subscriberRoutes.routes());

// 使用报刊路由
router.use("/api", newspaperRoutes.routes());

// 使用订阅路由
router.use("/api", subscriptionRoutes.routes());

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
