import React, { useState } from 'react';
import { Subscription } from '../types';

interface SubscriptionListProps {
  subscriptions: Subscription[];
  onDelete: (id: number) => void;
  onEdit: (subscription: Subscription) => void;
}

// 编辑表单的接口，日期字段使用字符串
interface EditSubscriptionForm {
  subscriber_id?: number;
  newspaper_id?: number;
  start_date?: string; // 用于input type="date"的字符串
  end_date?: string;   // 用于input type="date"的字符串
  status?: string;
}

const SubscriptionList: React.FC<SubscriptionListProps> = ({ subscriptions, onDelete, onEdit }) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<EditSubscriptionForm>({});

  const handleEditClick = (subscription: Subscription) => {
    setEditingId(subscription.id);
    
    // 处理日期字段：可能是Date对象或字符串
    const startDate = subscription.start_date instanceof Date 
      ? subscription.start_date.toISOString().split('T')[0]
      : new Date(subscription.start_date).toISOString().split('T')[0];
    
    const endDate = subscription.end_date instanceof Date
      ? subscription.end_date.toISOString().split('T')[0]
      : new Date(subscription.end_date).toISOString().split('T')[0];
    
    setEditForm({
      subscriber_id: subscription.subscriber_id,
      newspaper_id: subscription.newspaper_id,
      start_date: startDate,
      end_date: endDate,
      status: subscription.status,
    });
  };

  const handleSaveClick = (id: number) => {
    if (editForm.subscriber_id && editForm.newspaper_id && editForm.start_date && editForm.end_date && editForm.status) {
      onEdit({ 
        id, 
        subscriber_id: editForm.subscriber_id,
        newspaper_id: editForm.newspaper_id,
        start_date: new Date(editForm.start_date),
        end_date: new Date(editForm.end_date),
        status: editForm.status,
        created_at: new Date(),
        updated_at: new Date(),
      } as Subscription);
      setEditingId(null);
      setEditForm({});
    }
  };

  const handleCancelClick = () => {
    setEditingId(null);
    setEditForm({});
  };
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

  // 按照ID排序
  const sortedSubscriptions = [...subscriptions].sort((a, b) => a.id - b.id);

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
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {sortedSubscriptions.map(subscription => {
            // 确保价格是数字
            const price = subscription.price ? 
              (typeof subscription.price === 'string' ? parseFloat(subscription.price) : subscription.price) : 
              null;
            
            return (
              <tr key={subscription.id}>
                <td>{subscription.id}</td>
                <td>
                  {editingId === subscription.id ? (
                    <input
                      type="number"
                      value={editForm.subscriber_id || ''}
                      onChange={(e) => setEditForm({ ...editForm, subscriber_id: parseInt(e.target.value) || 0 })}
                      className="edit-input"
                      placeholder="订户ID"
                    />
                  ) : (
                    <>
                      {subscription.subscriber_name || `订户 ${subscription.subscriber_id}`}
                      {subscription.subscriber_email && <br />}
                      {subscription.subscriber_email && <small>{subscription.subscriber_email}</small>}
                    </>
                  )}
                </td>
                <td>
                  {editingId === subscription.id ? (
                    <input
                      type="number"
                      value={editForm.newspaper_id || ''}
                      onChange={(e) => setEditForm({ ...editForm, newspaper_id: parseInt(e.target.value) || 0 })}
                      className="edit-input"
                      placeholder="报刊ID"
                    />
                  ) : (
                    <>
                      {subscription.newspaper_name || `报刊 ${subscription.newspaper_id}`}
                      {subscription.publisher && <br />}
                      {subscription.publisher && <small>{subscription.publisher}</small>}
                    </>
                  )}
                </td>
                <td>
                  {editingId === subscription.id ? (
                    <input
                      type="date"
                      value={editForm.start_date || ''}
                      onChange={(e) => setEditForm({ ...editForm, start_date: e.target.value })}
                      className="edit-input"
                    />
                  ) : (
                    new Date(subscription.start_date).toLocaleDateString('zh-CN')
                  )}
                </td>
                <td>
                  {editingId === subscription.id ? (
                    <input
                      type="date"
                      value={editForm.end_date || ''}
                      onChange={(e) => setEditForm({ ...editForm, end_date: e.target.value })}
                      className="edit-input"
                    />
                  ) : (
                    new Date(subscription.end_date).toLocaleDateString('zh-CN')
                  )}
                </td>
                <td>
                  {editingId === subscription.id ? (
                    <select
                      value={editForm.status || ''}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      className="edit-input"
                    >
                      <option value="active">活跃</option>
                      <option value="expired">已过期</option>
                      <option value="cancelled">已取消</option>
                    </select>
                  ) : (
                    getStatusBadge(subscription.status)
                  )}
                </td>
                <td>{price ? `¥${price.toFixed(2)}` : '-'}</td>
                <td>{new Date(subscription.created_at).toLocaleDateString('zh-CN')}</td>
                <td>
                  {editingId === subscription.id ? (
                    <>
                      <button 
                        onClick={() => handleSaveClick(subscription.id)}
                        className="btn-save"
                      >
                        保存
                      </button>
                      <button 
                        onClick={handleCancelClick}
                        className="btn-cancel"
                      >
                        取消
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => handleEditClick(subscription)}
                        className="btn-edit"
                      >
                        编辑
                      </button>
                      <button 
                        onClick={() => onDelete(subscription.id)}
                        className="btn-delete"
                      >
                        删除
                      </button>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default SubscriptionList;
