import React, { useState } from 'react';
import { Subscriber, Newspaper, CreateSubscriptionDTO } from '../types';

interface AddSubscriptionFormProps {
  onSubmit: (subscription: CreateSubscriptionDTO) => void;
  subscribers: Subscriber[];
  newspapers: Newspaper[];
}

const AddSubscriptionForm: React.FC<AddSubscriptionFormProps> = ({ 
  onSubmit, 
  subscribers, 
  newspapers 
}) => {
  const [formData, setFormData] = useState<CreateSubscriptionDTO>({
    subscriber_id: 0,
    newspaper_id: 0,
    start_date: '',
    end_date: '',
    status: 'active'
  });

  const statusOptions = ['active', 'expired', 'cancelled'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'subscriber_id' || name === 'newspaper_id' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 简单的表单验证
    if (!formData.subscriber_id || !formData.newspaper_id || !formData.start_date || !formData.end_date) {
      alert('请填写所有必填字段');
      return;
    }

    const startDate = new Date(formData.start_date);
    const endDate = new Date(formData.end_date);
    
    if (startDate >= endDate) {
      alert('结束日期必须晚于开始日期');
      return;
    }

    if (endDate < new Date()) {
      alert('结束日期不能早于今天');
      return;
    }

    onSubmit(formData);
    
    // 重置表单
    setFormData({
      subscriber_id: 0,
      newspaper_id: 0,
      start_date: '',
      end_date: '',
      status: 'active'
    });
  };

  // 获取今天的日期，格式为YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];

  return (
    <form className="add-subscription-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="subscriber_id">订户 *</label>
        <select
          id="subscriber_id"
          name="subscriber_id"
          value={formData.subscriber_id}
          onChange={handleChange}
          required
        >
          <option value="0">请选择订户</option>
          {subscribers.map(subscriber => (
            <option key={subscriber.id} value={subscriber.id}>
              {subscriber.name} ({subscriber.email})
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="newspaper_id">报刊 *</label>
        <select
          id="newspaper_id"
          name="newspaper_id"
          value={formData.newspaper_id}
          onChange={handleChange}
          required
        >
          <option value="0">请选择报刊</option>
          {newspapers.map(newspaper => {
            // 确保价格是数字
            const price = typeof newspaper.price === 'string' ? parseFloat(newspaper.price) : newspaper.price;
            return (
              <option key={newspaper.id} value={newspaper.id}>
                {newspaper.name} (¥{price.toFixed(2)})
              </option>
            );
          })}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="start_date">开始日期 *</label>
        <input
          type="date"
          id="start_date"
          name="start_date"
          value={formData.start_date}
          onChange={handleChange}
          min={today}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="end_date">结束日期 *</label>
        <input
          type="date"
          id="end_date"
          name="end_date"
          value={formData.end_date}
          onChange={handleChange}
          min={formData.start_date || today}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="status">状态</label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
        >
          {statusOptions.map(option => (
            <option key={option} value={option}>
              {option === 'active' ? '活跃' : 
               option === 'expired' ? '已过期' : '已取消'}
            </option>
          ))}
        </select>
      </div>

      <button type="submit" className="submit-btn">
        添加订阅
      </button>
    </form>
  );
};

export default AddSubscriptionForm;
