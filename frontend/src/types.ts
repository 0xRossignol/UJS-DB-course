export interface Subscriber {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  created_at: Date;
  updated_at: Date;
}

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

export interface CreateSubscriberDTO {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface CreateNewspaperDTO {
  name: string;
  publisher: string;
  frequency: string;
  price: number;
  description?: string;
}

export interface CreateSubscriptionDTO {
  subscriber_id: number;
  newspaper_id: number;
  start_date: string; // ISO格式日期字符串
  end_date: string;   // ISO格式日期字符串
  status?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  mode?: string;
  error?: string;
}
