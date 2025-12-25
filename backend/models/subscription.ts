export interface Subscription {
  id: number;
  subscriber_id: number;
  newspaper_id: number;
  start_date: Date;
  end_date: Date;
  status: string;
  created_at: Date;
  updated_at: Date;
  subscriber_name?: string;
  subscriber_email?: string;
  newspaper_name?: string;
  publisher?: string;
  price?: number;
}

export interface CreateSubscriptionDTO {
  subscriber_id: number;
  newspaper_id: number;
  start_date: string; // ISO格式日期字符串
  end_date: string;   // ISO格式日期字符串
  status?: string;
}

export interface UpdateSubscriptionDTO {
  subscriber_id?: number;
  newspaper_id?: number;
  start_date?: string;
  end_date?: string;
  status?: string;
}

// 数据库查询结果转换为模型
export function mapToSubscription(data: any): Subscription {
  return {
    id: data.id,
    subscriber_id: data.subscriber_id,
    newspaper_id: data.newspaper_id,
    start_date: new Date(data.start_date),
    end_date: new Date(data.end_date),
    status: data.status,
    created_at: new Date(data.created_at),
    updated_at: new Date(data.updated_at),
    subscriber_name: data.subscriber_name,
    subscriber_email: data.subscriber_email,
    newspaper_name: data.newspaper_name,
    publisher: data.publisher,
    price: data.price ? parseFloat(data.price) : undefined,
  };
}
