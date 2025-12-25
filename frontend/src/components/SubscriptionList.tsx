import React from 'react';
import { Subscription } from '../types';

interface SubscriptionListProps {
  subscriptions: Subscription[];
}

const SubscriptionList: React.FC<SubscriptionListProps> = ({ subscriptions }) => {
  if (subscriptions.length === 0) {
    return (
      <div className="empty-state">
        <p>暂无订阅数据</p>
        <p>请点击上方表单添加订阅</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="status-badge status-active">活跃</span>;
      case 'expired':
        return <span className="status-badge status-expired">已过期</span>;
      case 'cancelled':
        return <span className="status-badge status-cancelled">已取消</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  return (
    <div className="subscription-list">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>订户</th>
            <th>报刊</th>
            <th>开始日期</th>
            <th>结束日期</th>
            <th>状态</th>
            <th>价格</th>
            <th>创建时间</th>
          </tr>
        </thead>
        <tbody>
          {subscriptions.map(subscription => {
            // 确保价格是数字
            const price = subscription.price ? 
              (typeof subscription.price === 'string' ? parseFloat(subscription.price) : subscription.price) : 
              null;
            
            return (
              <tr key={subscription.id}>
                <td>{subscription.id}</td>
                <td>
                  {subscription.subscriber_name || `订户 ${subscription.subscriber_id}`}
                  {subscription.subscriber_email && <br />}
                  {subscription.subscriber_email && <small>{subscription.subscriber_email}</small>}
                </td>
                <td>
                  {subscription.newspaper_name || `报刊 ${subscription.newspaper_id}`}
                  {subscription.publisher && <br />}
                  {subscription.publisher && <small>{subscription.publisher}</small>}
                </td>
                <td>{new Date(subscription.start_date).toLocaleDateString('zh-CN')}</td>
                <td>{new Date(subscription.end_date).toLocaleDateString('zh-CN')}</td>
                <td>{getStatusBadge(subscription.status)}</td>
                <td>{price ? `¥${price.toFixed(2)}` : '-'}</td>
                <td>{new Date(subscription.created_at).toLocaleDateString('zh-CN')}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default SubscriptionList;
