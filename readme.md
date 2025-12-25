# 订户订阅报刊管理系统 - 数据库课程设计项目

## 项目简介
这是一个基于数据库课程设计的订户订阅报刊管理系统，采用前后端分离架构，使用TypeScript作为前后端语言，React搭建前端界面，Deno搭建后端，MySQL作为数据库。

## 项目特点
1. **简单易用**：界面简洁，操作直观
2. **前后端分离**：使用RESTful API通信
3. **类型安全**：全程使用TypeScript
4. **数据库规范**：符合数据库设计规范
5. **扩展性强**：模块化设计，易于扩展

## 技术栈
- **前端**: React 18 + TypeScript + Vite
- **后端**: Deno + TypeScript + Oak框架
- **数据库**: MySQL 8.0+
- **通信**: RESTful API

## 项目结构
```
课设/
├── 数据库设计.md          # 数据库设计文档
├── 数据库脚本.sql         # MySQL数据库脚本
├── 项目运行说明.md        # 详细运行说明
├── readme.md             # 本项目说明
├── backend/              # Deno后端项目
│   ├── config/          # 配置文件
│   ├── controllers/     # 控制器
│   ├── models/          # 数据模型
│   ├── routes/          # 路由定义
│   ├── utils/           # 工具函数
│   ├── .env.example     # 环境变量示例
│   ├── deno.json        # Deno配置文件
│   └── main.ts          # 主入口文件
└── frontend/            # React前端项目
    ├── public/          # 静态资源
    ├── src/             # 源代码
    │   ├── components/  # React组件
    │   ├── types.ts     # TypeScript类型定义
    │   ├── App.tsx      # 主应用组件
    │   └── index.tsx    # 入口文件
    ├── package.json     # 前端依赖配置
    └── tsconfig.json    # TypeScript配置
```

## 快速开始

### 第一步：数据库准备
1. 确保MySQL服务正在运行
2. 执行数据库脚本：
   ```bash
   mysql -u root -p < 数据库脚本.sql
   ```
3. 脚本会自动创建数据库和表结构，并插入示例数据

### 第二步：后端配置
1. 进入后端目录：
   ```bash
   cd backend
   ```
2. 复制环境变量配置文件：
   ```bash
   cp .env.example .env
   ```
3. 编辑`.env`文件，配置数据库连接信息

### 第三步：启动后端服务
1. 安装Deno依赖（自动安装）：
   ```bash
   deno cache main.ts
   ```
2. 启动后端服务器：
   ```bash
   deno run --allow-net --allow-env --allow-read main.ts
   ```
3. 服务器将启动在 http://localhost:8001

### 第四步：前端配置
1. 进入前端目录：
   ```bash
   cd frontend
   ```
2. 安装依赖：
   ```bash
   npm install
   ```

### 第五步：启动前端服务
1. 启动开发服务器：
   ```bash
   npm start
   ```
2. 前端将启动在 http://localhost:3000

## 功能模块

### 1. 订户管理
- 查看订户列表
- 添加新订户
- 显示订户详细信息

### 2. 报刊管理
- 查看报刊列表
- 添加新报刊
- 显示报刊详细信息

### 3. 订阅管理
- 查看订阅列表
- 添加新订阅
- 管理订阅状态（活跃/过期/取消）

### 4. 系统统计
- 订户总数统计
- 报刊总数统计
- 订阅总数统计

## API接口
- `GET /api/health` - 健康检查
- `GET /api/subscribers` - 获取订户列表
- `GET /api/newspapers` - 获取报刊列表
- `GET /api/subscriptions` - 获取订阅列表

## 数据库设计
数据库包含3个主要表：
1. **subscribers** - 订户表
2. **newspapers** - 报刊表
3. **subscriptions** - 订阅关系表

详细设计见[数据库设计.md](数据库设计.md)

## 开发说明

### 后端开发
- 模型定义在`backend/models/`目录
- 控制器定义在`backend/controllers/`目录
- 路由定义在`backend/routes/`目录
- 配置定义在`backend/config/`目录

### 前端开发
- 组件定义在`frontend/src/components/`目录
- 类型定义在`frontend/src/types.ts`文件
- 样式定义在`frontend/src/App.css`文件

## 故障排除

### 常见问题
1. **数据库连接失败**：检查MySQL服务是否运行，检查`.env`文件配置
2. **端口冲突**：修改`.env`文件中的PORT配置
3. **CORS错误**：确保前端地址正确配置在`CORS_ORIGIN`中
4. **前端编译错误**：检查Node.js版本，重新安装依赖

## 联系方式
如有问题，请参考项目文档或联系项目维护者。

---
*最后更新：2025年12月25日*
