import React, { useState } from 'react';
import { Subscriber } from '../types';

interface SubscriberListProps {
  subscribers: Subscriber[];
  onDelete: (id: number) => void;
  onEdit: (subscriber: Subscriber) => void;
}

const SubscriberList: React.FC<SubscriberListProps> = ({ subscribers, onDelete, onEdit }) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Subscriber>>({});

  const handleEditClick = (subscriber: Subscriber) => {
    setEditingId(subscriber.id);
    setEditForm({
      name: subscriber.name,
      email: subscriber.email,
      phone: subscriber.phone,
      address: subscriber.address,
    });
  };

  const handleSaveClick = (id: number) => {
    if (editForm.name && editForm.email && editForm.phone && editForm.address) {
      onEdit({ id, ...editForm } as Subscriber);
      setEditingId(null);
      setEditForm({});
    }
  };

  const handleCancelClick = () => {
    setEditingId(null);
    setEditForm({});
  };

  if (subscribers.length === 0) {
    return (
      <div className="empty-state">
        <p>暂无订户数据</p>
        <p>请点击上方表单添加订户</p>
      </div>
    );
  }

  // 按照ID排序
  const sortedSubscribers = [...subscribers].sort((a, b) => a.id - b.id);

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
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {sortedSubscribers.map(subscriber => (
            <tr key={subscriber.id}>
              <td>{subscriber.id}</td>
              <td>
                {editingId === subscriber.id ? (
                  <input
                    type="text"
                    value={editForm.name || ''}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="edit-input"
                  />
                ) : (
                  subscriber.name
                )}
              </td>
              <td>
                {editingId === subscriber.id ? (
                  <input
                    type="email"
                    value={editForm.email || ''}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="edit-input"
                  />
                ) : (
                  subscriber.email
                )}
              </td>
              <td>
                {editingId === subscriber.id ? (
                  <input
                    type="tel"
                    value={editForm.phone || ''}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="edit-input"
                  />
                ) : (
                  subscriber.phone
                )}
              </td>
              <td>
                {editingId === subscriber.id ? (
                  <input
                    type="text"
                    value={editForm.address || ''}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    className="edit-input"
                  />
                ) : (
                  subscriber.address
                )}
              </td>
              <td>{new Date(subscriber.created_at).toLocaleDateString('zh-CN')}</td>
              <td>
                {editingId === subscriber.id ? (
                  <>
                    <button 
                      onClick={() => handleSaveClick(subscriber.id)}
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
                      onClick={() => handleEditClick(subscriber)}
                      className="btn-edit"
                    >
                      编辑
                    </button>
                    <button 
                      onClick={() => onDelete(subscriber.id)}
                      className="btn-delete"
                    >
                      删除
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SubscriberList;
