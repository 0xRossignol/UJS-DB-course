import React, { useState } from 'react';
import { Newspaper } from '../types';

interface NewspaperListProps {
  newspapers: Newspaper[];
  onDelete: (id: number) => void;
  onEdit: (newspaper: Newspaper) => void;
}

const NewspaperList: React.FC<NewspaperListProps> = ({ newspapers, onDelete, onEdit }) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Newspaper>>({});

  const handleEditClick = (newspaper: Newspaper) => {
    setEditingId(newspaper.id);
    setEditForm({
      name: newspaper.name,
      publisher: newspaper.publisher,
      frequency: newspaper.frequency,
      price: newspaper.price,
      description: newspaper.description,
    });
  };

  const handleSaveClick = (id: number) => {
    if (editForm.name && editForm.publisher && editForm.frequency && editForm.price !== undefined) {
      onEdit({ id, ...editForm } as Newspaper);
      setEditingId(null);
      setEditForm({});
    }
  };

  const handleCancelClick = () => {
    setEditingId(null);
    setEditForm({});
  };
  if (newspapers.length === 0) {
    return (
      <div className="empty-state">
        <p>暂无报刊数据</p>
        <p>请点击上方表单添加报刊</p>
      </div>
    );
  }

  // 按照ID排序
  const sortedNewspapers = [...newspapers].sort((a, b) => a.id - b.id);

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
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {sortedNewspapers.map(newspaper => {
            // 确保价格是数字
            const price = typeof newspaper.price === 'string' ? parseFloat(newspaper.price) : newspaper.price;
            const currentPrice = editingId === newspaper.id ? 
              (typeof editForm.price === 'string' ? parseFloat(editForm.price) : (editForm.price || 0)) : 
              price;
            
            return (
              <tr key={newspaper.id}>
                <td>{newspaper.id}</td>
                <td>
                  {editingId === newspaper.id ? (
                    <input
                      type="text"
                      value={editForm.name || ''}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="edit-input"
                    />
                  ) : (
                    newspaper.name
                  )}
                </td>
                <td>
                  {editingId === newspaper.id ? (
                    <input
                      type="text"
                      value={editForm.publisher || ''}
                      onChange={(e) => setEditForm({ ...editForm, publisher: e.target.value })}
                      className="edit-input"
                    />
                  ) : (
                    newspaper.publisher
                  )}
                </td>
                <td>
                  {editingId === newspaper.id ? (
                    <input
                      type="text"
                      value={editForm.frequency || ''}
                      onChange={(e) => setEditForm({ ...editForm, frequency: e.target.value })}
                      className="edit-input"
                    />
                  ) : (
                    newspaper.frequency
                  )}
                </td>
                <td>
                  {editingId === newspaper.id ? (
                    <input
                      type="number"
                      step="0.01"
                      value={editForm.price || ''}
                      onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) || 0 })}
                      className="edit-input"
                    />
                  ) : (
                    `¥${currentPrice.toFixed(2)}`
                  )}
                </td>
                <td>
                  {editingId === newspaper.id ? (
                    <input
                      type="text"
                      value={editForm.description || ''}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className="edit-input"
                    />
                  ) : (
                    newspaper.description || '-'
                  )}
                </td>
                <td>{new Date(newspaper.created_at).toLocaleDateString('zh-CN')}</td>
                <td>
                  {editingId === newspaper.id ? (
                    <>
                      <button 
                        onClick={() => handleSaveClick(newspaper.id)}
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
                        onClick={() => handleEditClick(newspaper)}
                        className="btn-edit"
                      >
                        编辑
                      </button>
                      <button 
                        onClick={() => onDelete(newspaper.id)}
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

export default NewspaperList;
