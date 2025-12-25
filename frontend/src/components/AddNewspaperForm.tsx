import React, { useState } from 'react';
import { CreateNewspaperDTO } from '../types';

interface AddNewspaperFormProps {
  onSubmit: (newspaper: CreateNewspaperDTO) => void;
}

const AddNewspaperForm: React.FC<AddNewspaperFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<CreateNewspaperDTO>({
    name: '',
    publisher: '',
    frequency: '月刊',
    price: 0,
    description: ''
  });

  const frequencyOptions = ['日刊', '周刊', '月刊', '季刊', '年刊'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 简单的表单验证
    if (!formData.name.trim() || !formData.publisher.trim() || !formData.frequency) {
      alert('请填写所有必填字段');
      return;
    }

    if (formData.price <= 0) {
      alert('价格必须大于0');
      return;
    }

    onSubmit(formData);
    
    // 重置表单
    setFormData({
      name: '',
      publisher: '',
      frequency: '月刊',
      price: 0,
      description: ''
    });
  };

  return (
    <form className="add-newspaper-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="name">报刊名称 *</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="请输入报刊名称"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="publisher">出版社 *</label>
        <input
          type="text"
          id="publisher"
          name="publisher"
          value={formData.publisher}
          onChange={handleChange}
          placeholder="请输入出版社名称"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="frequency">出版频率 *</label>
        <select
          id="frequency"
          name="frequency"
          value={formData.frequency}
          onChange={handleChange}
          required
        >
          {frequencyOptions.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="price">价格（元） *</label>
        <input
          type="number"
          id="price"
          name="price"
          value={formData.price}
          onChange={handleChange}
          placeholder="请输入价格"
          min="0"
          step="0.01"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">描述</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="请输入报刊描述（可选）"
          rows={3}
        />
      </div>

      <button type="submit" className="submit-btn">
        添加报刊
      </button>
    </form>
  );
};

export default AddNewspaperForm;
