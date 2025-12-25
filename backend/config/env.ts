import { load } from "@std/dotenv";

// 加载环境变量
const env = await load();

export const config = {
  database: {
    host: env.DB_HOST || "localhost",
    port: parseInt(env.DB_PORT || "3306"),
    user: env.DB_USER || "root",
    password: env.DB_PASSWORD || "",
    database: env.DB_NAME || "newspaper_subscription",
  },
  server: {
    port: parseInt(env.PORT || "8001"),
    corsOrigin: env.CORS_ORIGIN || "http://localhost:3000",
  },
};

// 验证必要配置
if (!config.database.host || !config.database.user || !config.database.database) {
  console.error("数据库配置不完整，请检查.env文件");
  console.log("使用默认配置继续运行...");
}

console.log("环境配置加载完成");
console.log(`数据库: ${config.database.database}@${config.database.host}:${config.database.port}`);
console.log(`服务器端口: ${config.server.port}`);
console.log(`CORS来源: ${config.server.corsOrigin}`);
