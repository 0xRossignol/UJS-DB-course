import { Router } from "@oak/oak";
import { SubscriberController } from "../controllers/subscriberController.ts";

const router = new Router();

// 获取所有订户
router.get("/subscribers", async (ctx) => {
  try {
    const subscribers = await SubscriberController.getAll();
    ctx.response.body = {
      success: true,
      data: subscribers,
      message: "获取订户列表成功",
    };
  } catch (error: any) {
    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      data: [],
      message: "获取订户列表失败",
      error: error.message,
    };
  }
});

// 根据ID获取订户
router.get("/subscribers/:id", async (ctx) => {
  try {
    const id = parseInt(ctx.params.id);
    if (isNaN(id)) {
      ctx.response.status = 400;
      ctx.response.body = {
        success: false,
        message: "ID必须是数字",
      };
      return;
    }

    const subscriber = await SubscriberController.getById(id);
    if (!subscriber) {
      ctx.response.status = 404;
      ctx.response.body = {
        success: false,
        message: "订户不存在",
      };
      return;
    }

    ctx.response.body = {
      success: true,
      data: subscriber,
      message: "获取订户成功",
    };
  } catch (error: any) {
    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      message: "获取订户失败",
      error: error.message,
    };
  }
});

// 创建新订户
router.post("/subscribers", async (ctx) => {
  try {
    const value = await ctx.request.body.json();
    
    // 验证必要字段
    if (!value.name || !value.email || !value.phone || !value.address) {
      ctx.response.status = 400;
      ctx.response.body = {
        success: false,
        message: "请提供完整的订户信息（姓名、邮箱、电话、地址）",
      };
      return;
    }

    const subscriberData = {
      name: value.name,
      email: value.email,
      phone: value.phone,
      address: value.address,
    };

    const newSubscriber = await SubscriberController.create(subscriberData);
    
    ctx.response.status = 201;
    ctx.response.body = {
      success: true,
      data: newSubscriber,
      message: "创建订户成功",
    };
  } catch (error: any) {
    ctx.response.status = 400;
    ctx.response.body = {
      success: false,
      message: error.message || "创建订户失败",
      error: error.message,
    };
  }
});

// 更新订户
router.put("/subscribers/:id", async (ctx) => {
  try {
    const id = parseInt(ctx.params.id);
    if (isNaN(id)) {
      ctx.response.status = 400;
      ctx.response.body = {
        success: false,
        message: "ID必须是数字",
      };
      return;
    }

    const value = await ctx.request.body.json();
    
    // 至少提供一个更新字段
    if (!value.name && !value.email && !value.phone && !value.address) {
      ctx.response.status = 400;
      ctx.response.body = {
        success: false,
        message: "请提供至少一个更新字段",
      };
      return;
    }

    const subscriberData = {
      name: value.name,
      email: value.email,
      phone: value.phone,
      address: value.address,
    };

    const updatedSubscriber = await SubscriberController.update(id, subscriberData);
    
    if (!updatedSubscriber) {
      ctx.response.status = 404;
      ctx.response.body = {
        success: false,
        message: "订户不存在",
      };
      return;
    }

    ctx.response.body = {
      success: true,
      data: updatedSubscriber,
      message: "更新订户成功",
    };
  } catch (error: any) {
    ctx.response.status = 400;
    ctx.response.body = {
      success: false,
      message: error.message || "更新订户失败",
      error: error.message,
    };
  }
});

// 删除订户
router.delete("/subscribers/:id", async (ctx) => {
  try {
    const id = parseInt(ctx.params.id);
    if (isNaN(id)) {
      ctx.response.status = 400;
      ctx.response.body = {
        success: false,
        message: "ID必须是数字",
      };
      return;
    }

    const deleted = await SubscriberController.delete(id);
    
    if (!deleted) {
      ctx.response.status = 404;
      ctx.response.body = {
        success: false,
        message: "订户不存在",
      };
      return;
    }

    ctx.response.body = {
      success: true,
      message: "删除订户成功",
    };
  } catch (error: any) {
    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      message: "删除订户失败",
      error: error.message,
    };
  }
});

// 搜索订户
router.get("/subscribers/search/:keyword", async (ctx) => {
  try {
    const keyword = ctx.params.keyword;
    if (!keyword || keyword.trim().length === 0) {
      ctx.response.status = 400;
      ctx.response.body = {
        success: false,
        message: "请输入搜索关键词",
      };
      return;
    }

    const subscribers = await SubscriberController.search(keyword);
    
    ctx.response.body = {
      success: true,
      data: subscribers,
      message: "搜索订户成功",
    };
  } catch (error: any) {
    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      data: [],
      message: "搜索订户失败",
      error: error.message,
    };
  }
});

// 获取订户统计
router.get("/subscribers/stats", async (ctx) => {
  try {
    const stats = await SubscriberController.getStats();
    
    ctx.response.body = {
      success: true,
      data: stats,
      message: "获取订户统计成功",
    };
  } catch (error: any) {
    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      message: "获取订户统计失败",
      error: error.message,
    };
  }
});

export { router };
