export interface Subscriber {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateSubscriberDTO {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface UpdateSubscriberDTO {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

// 数据库查询结果转换为模型
export function mapToSubscriber(data: any): Subscriber {
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    address: data.address,
    created_at: new Date(data.created_at),
    updated_at: new Date(data.updated_at),
  };
}
