import React from 'react';
import { Newspaper } from '../types';

interface NewspaperListProps {
  newspapers: Newspaper[];
}

const NewspaperList: React.FC<NewspaperListProps> = ({ newspapers }) => {
  if (newspapers.length === 0) {
    return (
      <div className="empty-state">
        <p>暂无报刊数据</p>
        <p>请点击上方表单添加报刊</p>
      </div>
    );
  }

  return (
    <div className="newspaper-list">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>报刊名称</th>
            <th>出版社</th>
            <th>出版频率</th>
            <th>价格（元）</th>
            <th>描述</th>
            <th>创建时间</th>
          </tr>
        </thead>
        <tbody>
          {newspapers.map(newspaper => {
            // 确保价格是数字
            const price = typeof newspaper.price === 'string' ? parseFloat(newspaper.price) : newspaper.price;
            return (
              <tr key={newspaper.id}>
                <td>{newspaper.id}</td>
                <td>{newspaper.name}</td>
                <td>{newspaper.publisher}</td>
                <td>{newspaper.frequency}</td>
                <td>¥{price.toFixed(2)}</td>
                <td>{newspaper.description || '-'}</td>
                <td>{new Date(newspaper.created_at).toLocaleDateString('zh-CN')}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default NewspaperList;
