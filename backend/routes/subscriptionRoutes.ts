import { Router } from "@oak/oak";
import { SubscriptionController } from "../controllers/subscriptionController.ts";

const router = new Router();

// 获取所有订阅
router.get("/subscriptions", async (ctx) => {
  try {
    const subscriptions = await SubscriptionController.getAll();
    ctx.response.body = {
      success: true,
      data: subscriptions,
      message: "获取订阅列表成功",
    };
  } catch (error: any) {
    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      data: [],
      message: "获取订阅列表失败",
      error: error.message,
    };
  }
});

// 根据ID获取订阅
router.get("/subscriptions/:id", async (ctx) => {
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

    const subscription = await SubscriptionController.getById(id);
    if (!subscription) {
      ctx.response.status = 404;
      ctx.response.body = {
        success: false,
        message: "订阅不存在",
      };
      return;
    }

    ctx.response.body = {
      success: true,
      data: subscription,
      message: "获取订阅成功",
    };
  } catch (error: any) {
    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      message: "获取订阅失败",
      error: error.message,
    };
  }
});

// 创建新订阅
router.post("/subscriptions", async (ctx) => {
  try {
    const value = await ctx.request.body.json();
    
    // 验证必要字段
    if (!value.subscriber_id || !value.newspaper_id || !value.start_date || !value.end_date) {
      ctx.response.status = 400;
      ctx.response.body = {
        success: false,
        message: "请提供完整的订阅信息（订户ID、报刊ID、开始日期、结束日期）",
      };
      return;
    }

    const subscriptionData = {
      subscriber_id: parseInt(value.subscriber_id),
      newspaper_id: parseInt(value.newspaper_id),
      start_date: value.start_date,
      end_date: value.end_date,
      status: value.status || 'active',
    };

    const newSubscription = await SubscriptionController.create(subscriptionData);
    
    ctx.response.status = 201;
    ctx.response.body = {
      success: true,
      data: newSubscription,
      message: "创建订阅成功",
    };
  } catch (error: any) {
    ctx.response.status = 400;
    ctx.response.body = {
      success: false,
      message: error.message || "创建订阅失败",
      error: error.message,
    };
  }
});

// 更新订阅
router.put("/subscriptions/:id", async (ctx) => {
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
    if (!value.subscriber_id && !value.newspaper_id && !value.start_date && !value.end_date && !value.status) {
      ctx.response.status = 400;
      ctx.response.body = {
        success: false,
        message: "请提供至少一个更新字段",
      };
      return;
    }

    const subscriptionData: any = {};
    if (value.subscriber_id !== undefined) subscriptionData.subscriber_id = parseInt(value.subscriber_id);
    if (value.newspaper_id !== undefined) subscriptionData.newspaper_id = parseInt(value.newspaper_id);
    if (value.start_date !== undefined) subscriptionData.start_date = value.start_date;
    if (value.end_date !== undefined) subscriptionData.end_date = value.end_date;
    if (value.status !== undefined) subscriptionData.status = value.status;

    const updatedSubscription = await SubscriptionController.update(id, subscriptionData);
    
    if (!updatedSubscription) {
      ctx.response.status = 404;
      ctx.response.body = {
        success: false,
        message: "订阅不存在",
      };
      return;
    }

    ctx.response.body = {
      success: true,
      data: updatedSubscription,
      message: "更新订阅成功",
    };
  } catch (error: any) {
    ctx.response.status = 400;
    ctx.response.body = {
      success: false,
      message: error.message || "更新订阅失败",
      error: error.message,
    };
  }
});

// 删除订阅
router.delete("/subscriptions/:id", async (ctx) => {
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

    const deleted = await SubscriptionController.delete(id);
    
    if (!deleted) {
      ctx.response.status = 404;
      ctx.response.body = {
        success: false,
        message: "订阅不存在",
      };
      return;
    }

    ctx.response.body = {
      success: true,
      message: "删除订阅成功",
    };
  } catch (error: any) {
    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      message: "删除订阅失败",
      error: error.message,
    };
  }
});

// 搜索订阅
router.get("/subscriptions/search/:keyword", async (ctx) => {
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

    const subscriptions = await SubscriptionController.search(keyword);
    
    ctx.response.body = {
      success: true,
      data: subscriptions,
      message: "搜索订阅成功",
    };
  } catch (error: any) {
    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      data: [],
      message: "搜索订阅失败",
      error: error.message,
    };
  }
});

// 获取订阅统计
router.get("/subscriptions/stats", async (ctx) => {
  try {
    const stats = await SubscriptionController.getStats();
    
    ctx.response.body = {
      success: true,
      data: stats,
      message: "获取订阅统计成功",
    };
  } catch (error: any) {
    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      message: "获取订阅统计失败",
      error: error.message,
    };
  }
});

// 按订户ID查询订阅
router.get("/subscriptions/subscriber/:subscriberId", async (ctx) => {
  try {
    const subscriberId = parseInt(ctx.params.subscriberId);
    if (isNaN(subscriberId)) {
      ctx.response.status = 400;
      ctx.response.body = {
        success: false,
        message: "订户ID必须是数字",
      };
      return;
    }

    const subscriptions = await SubscriptionController.getBySubscriberId(subscriberId);
    
    ctx.response.body = {
      success: true,
      data: subscriptions,
      message: "按订户查询订阅成功",
    };
  } catch (error: any) {
    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      data: [],
      message: "按订户查询订阅失败",
      error: error.message,
    };
  }
});

// 按报刊ID查询订阅
router.get("/subscriptions/newspaper/:newspaperId", async (ctx) => {
  try {
    const newspaperId = parseInt(ctx.params.newspaperId);
    if (isNaN(newspaperId)) {
      ctx.response.status = 400;
      ctx.response.body = {
        success: false,
        message: "报刊ID必须是数字",
      };
      return;
    }

    const subscriptions = await SubscriptionController.getByNewspaperId(newspaperId);
    
    ctx.response.body = {
      success: true,
      data: subscriptions,
      message: "按报刊查询订阅成功",
    };
  } catch (error: any) {
    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      data: [],
      message: "按报刊查询订阅失败",
      error: error.message,
    };
  }
});

// 按状态查询订阅
router.get("/subscriptions/status/:status", async (ctx) => {
  try {
    const status = ctx.params.status;
    const validStatuses = ['active', 'expired', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      ctx.response.status = 400;
      ctx.response.body = {
        success: false,
        message: "状态必须是 active、expired 或 cancelled",
      };
      return;
    }

    const subscriptions = await SubscriptionController.getByStatus(status);
    
    ctx.response.body = {
      success: true,
      data: subscriptions,
      message: "按状态查询订阅成功",
    };
  } catch (error: any) {
    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      data: [],
      message: "按状态查询订阅失败",
      error: error.message,
    };
  }
});

// 查询即将过期的订阅
router.get("/subscriptions/expiring-soon/:days?", async (ctx) => {
  try {
    const days = ctx.params.days ? parseInt(ctx.params.days) : 30;
    
    if (isNaN(days) || days < 1 || days > 365) {
      ctx.response.status = 400;
      ctx.response.body = {
        success: false,
        message: "天数必须是1-365之间的数字",
      };
      return;
    }

    const subscriptions = await SubscriptionController.getExpiringSoon(days);
    
    ctx.response.body = {
      success: true,
      data: subscriptions,
      message: "查询即将过期订阅成功",
    };
  } catch (error: any) {
    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      data: [],
      message: "查询即将过期订阅失败",
      error: error.message,
    };
  }
});

export { router };
