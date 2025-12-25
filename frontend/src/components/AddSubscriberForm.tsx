import React, { useState } from 'react';
import { CreateSubscriberDTO } from '../types';

interface AddSubscriberFormProps {
  onSubmit: (subscriber: CreateSubscriberDTO) => void;
}

const AddSubscriberForm: React.FC<AddSubscriberFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<CreateSubscriberDTO>({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 简单的表单验证
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.address.trim()) {
      alert('请填写所有必填字段');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      alert('请输入有效的邮箱地址');
      return;
    }

    onSubmit(formData);
    
    // 重置表单
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: ''
    });
  };

  return (
    <form className="add-subscriber-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="name">姓名 *</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="请输入订户姓名"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="email">邮箱 *</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="请输入邮箱地址"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="phone">电话 *</label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="请输入联系电话"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="address">地址 *</label>
        <input
          type="text"
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="请输入联系地址"
          required
        />
      </div>

      <button type="submit" className="submit-btn">
        添加订户
      </button>
    </form>
  );
};

export default AddSubscriberForm;
