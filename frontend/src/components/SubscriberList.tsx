import React from 'react';
import { Subscriber } from '../types';

interface SubscriberListProps {
  subscribers: Subscriber[];
}

const SubscriberList: React.FC<SubscriberListProps> = ({ subscribers }) => {
  if (subscribers.length === 0) {
    return (
      <div className="empty-state">
        <p>暂无订户数据</p>
        <p>请点击上方表单添加订户</p>
      </div>
    );
  }

  return (
    <div className="subscriber-list">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>姓名</th>
            <th>邮箱</th>
            <th>电话</th>
            <th>地址</th>
            <th>创建时间</th>
          </tr>
        </thead>
        <tbody>
          {subscribers.map(subscriber => (
            <tr key={subscriber.id}>
              <td>{subscriber.id}</td>
              <td>{subscriber.name}</td>
              <td>{subscriber.email}</td>
              <td>{subscriber.phone}</td>
              <td>{subscriber.address}</td>
              <td>{new Date(subscriber.created_at).toLocaleDateString('zh-CN')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SubscriberList;
