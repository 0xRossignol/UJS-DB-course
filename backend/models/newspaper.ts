export interface Newspaper {
  id: number;
  name: string;
  publisher: string;
  frequency: string;
  price: number;
  description: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateNewspaperDTO {
  name: string;
  publisher: string;
  frequency: string;
  price: number;
  description?: string;
}

export interface UpdateNewspaperDTO {
  name?: string;
  publisher?: string;
  frequency?: string;
  price?: number;
  description?: string;
}

// 数据库查询结果转换为模型
export function mapToNewspaper(data: any): Newspaper {
  return {
    id: data.id,
    name: data.name,
    publisher: data.publisher,
    frequency: data.frequency,
    price: parseFloat(data.price), // 确保转换为数字
    description: data.description || null,
    created_at: new Date(data.created_at),
    updated_at: new Date(data.updated_at),
  };
}
