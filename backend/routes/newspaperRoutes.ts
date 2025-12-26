import { Router } from "@oak/oak";
import { NewspaperController } from "../controllers/newspaperController.ts";

const router = new Router();

// 获取所有报刊
router.get("/newspapers", async (ctx) => {
  try {
    const newspapers = await NewspaperController.getAll();
    ctx.response.body = {
      success: true,
      data: newspapers,
      message: "获取报刊列表成功",
    };
  } catch (error: any) {
    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      data: [],
      message: "获取报刊列表失败",
      error: error.message,
    };
  }
});

// 根据ID获取报刊
router.get("/newspapers/:id", async (ctx) => {
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

    const newspaper = await NewspaperController.getById(id);
    if (!newspaper) {
      ctx.response.status = 404;
      ctx.response.body = {
        success: false,
        message: "报刊不存在",
      };
      return;
    }

    ctx.response.body = {
      success: true,
      data: newspaper,
      message: "获取报刊成功",
    };
  } catch (error: any) {
    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      message: "获取报刊失败",
      error: error.message,
    };
  }
});

// 创建新报刊
router.post("/newspapers", async (ctx) => {
  try {
    const value = await ctx.request.body.json();
    
    // 验证必要字段
    if (!value.name || !value.publisher || !value.frequency || value.price === undefined) {
      ctx.response.status = 400;
      ctx.response.body = {
        success: false,
        message: "请提供完整的报刊信息（名称、出版社、频率、价格）",
      };
      return;
    }

    const newspaperData = {
      name: value.name,
      publisher: value.publisher,
      frequency: value.frequency,
      price: parseFloat(value.price),
      description: value.description,
    };

    const newNewspaper = await NewspaperController.create(newspaperData);
    
    ctx.response.status = 201;
    ctx.response.body = {
      success: true,
      data: newNewspaper,
      message: "创建报刊成功",
    };
  } catch (error: any) {
    ctx.response.status = 400;
    ctx.response.body = {
      success: false,
      message: error.message || "创建报刊失败",
      error: error.message,
    };
  }
});

// 更新报刊
router.put("/newspapers/:id", async (ctx) => {
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
    if (!value.name && !value.publisher && !value.frequency && value.price === undefined && !value.description) {
      ctx.response.status = 400;
      ctx.response.body = {
        success: false,
        message: "请提供至少一个更新字段",
      };
      return;
    }

    const newspaperData: any = {};
    if (value.name !== undefined) newspaperData.name = value.name;
    if (value.publisher !== undefined) newspaperData.publisher = value.publisher;
    if (value.frequency !== undefined) newspaperData.frequency = value.frequency;
    if (value.price !== undefined) newspaperData.price = parseFloat(value.price);
    if (value.description !== undefined) newspaperData.description = value.description;

    const updatedNewspaper = await NewspaperController.update(id, newspaperData);
    
    if (!updatedNewspaper) {
      ctx.response.status = 404;
      ctx.response.body = {
        success: false,
        message: "报刊不存在",
      };
      return;
    }

    ctx.response.body = {
      success: true,
      data: updatedNewspaper,
      message: "更新报刊成功",
    };
  } catch (error: any) {
    ctx.response.status = 400;
    ctx.response.body = {
      success: false,
      message: error.message || "更新报刊失败",
      error: error.message,
    };
  }
});

// 删除报刊
router.delete("/newspapers/:id", async (ctx) => {
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

    const deleted = await NewspaperController.delete(id);
    
    if (!deleted) {
      ctx.response.status = 404;
      ctx.response.body = {
        success: false,
        message: "报刊不存在或有关联订阅",
      };
      return;
    }

    ctx.response.body = {
      success: true,
      message: "删除报刊成功",
    };
  } catch (error: any) {
    ctx.response.status = 400;
    ctx.response.body = {
      success: false,
      message: error.message || "删除报刊失败",
      error: error.message,
    };
  }
});

// 搜索报刊
router.get("/newspapers/search/:keyword", async (ctx) => {
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

    const newspapers = await NewspaperController.search(keyword);
    
    ctx.response.body = {
      success: true,
      data: newspapers,
      message: "搜索报刊成功",
    };
  } catch (error: any) {
    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      data: [],
      message: "搜索报刊失败",
      error: error.message,
    };
  }
});

// 获取报刊统计
router.get("/newspapers/stats", async (ctx) => {
  try {
    const stats = await NewspaperController.getStats();
    
    ctx.response.body = {
      success: true,
      data: stats,
      message: "获取报刊统计成功",
    };
  } catch (error: any) {
    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      message: "获取报刊统计失败",
      error: error.message,
    };
  }
});

// 按价格范围查询报刊
router.get("/newspapers/price-range/:min/:max", async (ctx) => {
  try {
    const minPrice = parseFloat(ctx.params.min);
    const maxPrice = parseFloat(ctx.params.max);
    
    if (isNaN(minPrice) || isNaN(maxPrice)) {
      ctx.response.status = 400;
      ctx.response.body = {
        success: false,
        message: "价格必须是数字",
      };
      return;
    }

    if (minPrice < 0 || maxPrice < 0 || minPrice > maxPrice) {
      ctx.response.status = 400;
      ctx.response.body = {
        success: false,
        message: "价格范围无效",
      };
      return;
    }

    const newspapers = await NewspaperController.getByPriceRange(minPrice, maxPrice);
    
    ctx.response.body = {
      success: true,
      data: newspapers,
      message: "按价格范围查询报刊成功",
    };
  } catch (error: any) {
    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      data: [],
      message: "按价格范围查询报刊失败",
      error: error.message,
    };
  }
});

// 按出版社查询报刊
router.get("/newspapers/publisher/:publisher", async (ctx) => {
  try {
    const publisher = ctx.params.publisher;
    if (!publisher || publisher.trim().length === 0) {
      ctx.response.status = 400;
      ctx.response.body = {
        success: false,
        message: "请输入出版社名称",
      };
      return;
    }

    const newspapers = await NewspaperController.getByPublisher(publisher);
    
    ctx.response.body = {
      success: true,
      data: newspapers,
      message: "按出版社查询报刊成功",
    };
  } catch (error: any) {
    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      data: [],
      message: "按出版社查询报刊失败",
      error: error.message,
    };
  }
});

export { router };
