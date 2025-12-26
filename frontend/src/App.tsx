import React, { useState, useEffect } from 'react';
import './App.css';
import { 
  Subscriber, Newspaper, Subscription, 
  CreateSubscriberDTO, CreateNewspaperDTO, CreateSubscriptionDTO 
} from './types';
import SubscriberList from './components/SubscriberList';
import NewspaperList from './components/NewspaperList';
import SubscriptionList from './components/SubscriptionList';
import AddSubscriberForm from './components/AddSubscriberForm';
import AddNewspaperForm from './components/AddNewspaperForm';
import AddSubscriptionForm from './components/AddSubscriptionForm';

// 模态窗口组件
const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

function App() {
  const API_BASE_URL = 'http://localhost:8001/api';
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [newspapers, setNewspapers] = useState<Newspaper[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'subscribers' | 'newspapers' | 'subscriptions'>('subscribers');
  
  // 模态窗口状态
  const [showSubscriberModal, setShowSubscriberModal] = useState(false);
  const [showNewspaperModal, setShowNewspaperModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  
  // 搜索状态
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<{
    subscribers: Subscriber[];
    newspapers: Newspaper[];
    subscriptions: Subscription[];
  }>({ subscribers: [], newspapers: [], subscriptions: [] });
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subscribersRes, newspapersRes, subscriptionsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/subscribers`),
        fetch(`${API_BASE_URL}/newspapers`),
        fetch(`${API_BASE_URL}/subscriptions`)
      ]);

      const subscribersData = await subscribersRes.json();
      const newspapersData = await newspapersRes.json();
      const subscriptionsData = await subscriptionsRes.json();

      if (subscribersData.success) setSubscribers(subscribersData.data);
      if (newspapersData.success) setNewspapers(newspapersData.data);
      if (subscriptionsData.success) setSubscriptions(subscriptionsData.data);
    } catch (error) {
      console.error('获取数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubscriber = async (subscriber: CreateSubscriberDTO) => {
    try {
      const response = await fetch(`${API_BASE_URL}/subscribers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscriber),
      });

      const result = await response.json();
      if (result.success) {
        setSubscribers([...subscribers, result.data]);
        alert('订户添加成功！');
      } else {
        alert(`添加失败: ${result.message}`);
      }
    } catch (error) {
      console.error('添加订户失败:', error);
      alert('添加订户失败，请检查网络连接');
    }
  };

  const handleAddNewspaper = async (newspaper: CreateNewspaperDTO) => {
    try {
      const response = await fetch(`${API_BASE_URL}/newspapers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newspaper),
      });

      const result = await response.json();
      if (result.success) {
        setNewspapers([...newspapers, result.data]);
        alert('报刊添加成功！');
      } else {
        alert(`添加失败: ${result.message}`);
      }
    } catch (error) {
      console.error('添加报刊失败:', error);
      alert('添加报刊失败，请检查网络连接');
    }
  };

  const handleAddSubscription = async (subscription: CreateSubscriptionDTO) => {
    try {
      const response = await fetch(`${API_BASE_URL}/subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
      });

      const result = await response.json();
      if (result.success) {
        setSubscriptions([...subscriptions, result.data]);
        alert('订阅添加成功！');
      } else {
        alert(`添加失败: ${result.message}`);
      }
    } catch (error) {
      console.error('添加订阅失败:', error);
      alert('添加订阅失败，请检查网络连接');
    }
  };

  // 删除订户
  const handleDeleteSubscriber = async (id: number) => {
    if (!window.confirm('确定要删除这个订户吗？')) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/subscribers/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      
      if (result.success) {
        setSubscribers(subscribers.filter(s => s.id !== id));
        alert('订户删除成功！');
      } else {
        alert(`删除失败: ${result.message}`);
      }
    } catch (error) {
      console.error('删除订户失败:', error);
      alert('删除订户失败，请检查网络连接');
    }
  };

  // 更新订户
  const handleEditSubscriber = async (updatedSubscriber: Subscriber) => {
    try {
      const response = await fetch(`${API_BASE_URL}/subscribers/${updatedSubscriber.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: updatedSubscriber.name,
          email: updatedSubscriber.email,
          phone: updatedSubscriber.phone,
          address: updatedSubscriber.address,
        }),
      });
      const result = await response.json();
      
      if (result.success) {
        setSubscribers(subscribers.map(s => 
          s.id === updatedSubscriber.id ? result.data : s
        ));
        alert('订户更新成功！');
      } else {
        alert(`更新失败: ${result.message}`);
      }
    } catch (error) {
      console.error('更新订户失败:', error);
      alert('更新订户失败，请检查网络连接');
    }
  };

  // 删除报刊
  const handleDeleteNewspaper = async (id: number) => {
    if (!window.confirm('确定要删除这个报刊吗？')) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/newspapers/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      
      if (result.success) {
        setNewspapers(newspapers.filter(n => n.id !== id));
        alert('报刊删除成功！');
      } else {
        alert(`删除失败: ${result.message}`);
      }
    } catch (error) {
      console.error('删除报刊失败:', error);
      alert('删除报刊失败，请检查网络连接');
    }
  };

  // 更新报刊
  const handleEditNewspaper = async (updatedNewspaper: Newspaper) => {
    try {
      const response = await fetch(`${API_BASE_URL}/newspapers/${updatedNewspaper.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: updatedNewspaper.name,
          publisher: updatedNewspaper.publisher,
          frequency: updatedNewspaper.frequency,
          price: updatedNewspaper.price,
          description: updatedNewspaper.description,
        }),
      });
      const result = await response.json();
      
      if (result.success) {
        setNewspapers(newspapers.map(n => 
          n.id === updatedNewspaper.id ? result.data : n
        ));
        alert('报刊更新成功！');
      } else {
        alert(`更新失败: ${result.message}`);
      }
    } catch (error) {
      console.error('更新报刊失败:', error);
      alert('更新报刊失败，请检查网络连接');
    }
  };

  // 删除订阅
  const handleDeleteSubscription = async (id: number) => {
    if (!window.confirm('确定要删除这个订阅吗？')) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/subscriptions/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      
      if (result.success) {
        setSubscriptions(subscriptions.filter(s => s.id !== id));
        alert('订阅删除成功！');
      } else {
        alert(`删除失败: ${result.message}`);
      }
    } catch (error) {
      console.error('删除订阅失败:', error);
      alert('删除订阅失败，请检查网络连接');
    }
  };

  // 更新订阅
  const handleEditSubscription = async (updatedSubscription: Subscription) => {
    try {
      const response = await fetch(`${API_BASE_URL}/subscriptions/${updatedSubscription.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriber_id: updatedSubscription.subscriber_id,
          newspaper_id: updatedSubscription.newspaper_id,
          start_date: updatedSubscription.start_date.toISOString().split('T')[0],
          end_date: updatedSubscription.end_date.toISOString().split('T')[0],
          status: updatedSubscription.status,
        }),
      });
      const result = await response.json();
      
      if (result.success) {
        setSubscriptions(subscriptions.map(s => 
          s.id === updatedSubscription.id ? result.data : s
        ));
        alert('订阅更新成功！');
      } else {
        alert(`更新失败: ${result.message}`);
      }
    } catch (error) {
      console.error('更新订阅失败:', error);
      alert('更新订阅失败，请检查网络连接');
    }
  };

  // 搜索功能
  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      alert('请输入搜索关键词');
      return;
    }

    setIsSearching(true);
    try {
      const [subscribersRes, newspapersRes, subscriptionsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/subscribers/search/${encodeURIComponent(searchKeyword)}`),
        fetch(`${API_BASE_URL}/newspapers/search/${encodeURIComponent(searchKeyword)}`),
        fetch(`${API_BASE_URL}/subscriptions/search/${encodeURIComponent(searchKeyword)}`)
      ]);

      const subscribersData = await subscribersRes.json();
      const newspapersData = await newspapersRes.json();
      const subscriptionsData = await subscriptionsRes.json();

      setSearchResults({
        subscribers: subscribersData.success ? subscribersData.data : [],
        newspapers: newspapersData.success ? newspapersData.data : [],
        subscriptions: subscriptionsData.success ? subscriptionsData.data : [],
      });
    } catch (error) {
      console.error('搜索失败:', error);
      alert('搜索失败，请检查网络连接');
    } finally {
      setIsSearching(false);
    }
  };

  // 清除搜索
  const handleClearSearch = () => {
    setSearchKeyword('');
    setSearchResults({ subscribers: [], newspapers: [], subscriptions: [] });
  };

  // 获取当前显示的数据
  const getDisplayData = () => {
    if (searchKeyword.trim() && Object.values(searchResults).some(arr => arr.length > 0)) {
      return {
        subscribers: searchResults.subscribers,
        newspapers: searchResults.newspapers,
        subscriptions: searchResults.subscriptions,
      };
    }
    return { subscribers, newspapers, subscriptions };
  };

  const displayData = getDisplayData();

  if (loading) {
    return (
      <div className="App">
        <div className="loading">加载中...</div>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>📰 订户订阅报刊管理系统</h1>
        <p>数据库课程设计项目</p>
      </header>

      <main className="App-main">
        <div className="tabs">
          <button
            className={activeTab === 'subscribers' ? 'active' : ''}
            onClick={() => setActiveTab('subscribers')}
          >
            订户管理 ({subscribers.length})
          </button>
          <button
            className={activeTab === 'newspapers' ? 'active' : ''}
            onClick={() => setActiveTab('newspapers')}
          >
            报刊管理 ({newspapers.length})
          </button>
          <button
            className={activeTab === 'subscriptions' ? 'active' : ''}
            onClick={() => setActiveTab('subscriptions')}
          >
            订阅管理 ({subscriptions.length})
          </button>
        </div>

        {/* 搜索框 */}
        <div className="search-container">
          <div className="search-box">
            <input
              type="text"
              placeholder="输入关键词搜索订户、报刊或订阅..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="search-input"
            />
            <button 
              onClick={handleSearch} 
              className="search-btn"
              disabled={isSearching}
            >
              {isSearching ? '搜索中...' : '搜索'}
            </button>
            {searchKeyword && (
              <button 
                onClick={handleClearSearch} 
                className="clear-search-btn"
              >
                清除
              </button>
            )}
          </div>
          {searchKeyword && (
            <div className="search-info">
              <p>
                搜索关键词: <strong>"{searchKeyword}"</strong> | 
                搜索结果: 订户({searchResults.subscribers.length}) 报刊({searchResults.newspapers.length}) 订阅({searchResults.subscriptions.length})
              </p>
            </div>
          )}
        </div>

        <div className="content">
          <div className="tab-header">
            <h2>
              {activeTab === 'subscribers' && '订户列表'}
              {activeTab === 'newspapers' && '报刊列表'}
              {activeTab === 'subscriptions' && '订阅列表'}
            </h2>
            <button 
              className="add-btn"
              onClick={() => {
                if (activeTab === 'subscribers') setShowSubscriberModal(true);
                if (activeTab === 'newspapers') setShowNewspaperModal(true);
                if (activeTab === 'subscriptions') setShowSubscriptionModal(true);
              }}
            >
              + 添加
            </button>
          </div>

          {activeTab === 'subscribers' && (
            <SubscriberList 
              subscribers={displayData.subscribers} 
              onDelete={handleDeleteSubscriber}
              onEdit={handleEditSubscriber}
            />
          )}

          {activeTab === 'newspapers' && (
            <NewspaperList 
              newspapers={displayData.newspapers} 
              onDelete={handleDeleteNewspaper}
              onEdit={handleEditNewspaper}
            />
          )}

          {activeTab === 'subscriptions' && (
            <SubscriptionList 
              subscriptions={displayData.subscriptions} 
              onDelete={handleDeleteSubscription}
              onEdit={handleEditSubscription}
            />
          )}
        </div>

        <div className="stats">
          <div className="stat-card">
            <h3>📊 系统统计</h3>
            <p>订户总数: <strong>{subscribers.length}</strong></p>
            <p>报刊总数: <strong>{newspapers.length}</strong></p>
            <p>订阅总数: <strong>{subscriptions.length}</strong></p>
          </div>
          <div className="stat-card">
            <h3>💡 使用说明</h3>
            <p>1. 点击上方"添加"按钮添加数据</p>
            <p>2. 切换标签页查看不同数据</p>
            <p>3. 查看订阅关系和管理数据</p>
          </div>
        </div>
      </main>

      {/* 模态窗口 */}
      <Modal
        isOpen={showSubscriberModal}
        onClose={() => setShowSubscriberModal(false)}
        title="添加新订户"
      >
        <AddSubscriberForm 
          onSubmit={(subscriber) => {
            handleAddSubscriber(subscriber);
            setShowSubscriberModal(false);
          }} 
        />
      </Modal>

      <Modal
        isOpen={showNewspaperModal}
        onClose={() => setShowNewspaperModal(false)}
        title="添加新报刊"
      >
        <AddNewspaperForm 
          onSubmit={(newspaper) => {
            handleAddNewspaper(newspaper);
            setShowNewspaperModal(false);
          }} 
        />
      </Modal>

      <Modal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        title="添加新订阅"
      >
        <AddSubscriptionForm 
          onSubmit={(subscription) => {
            handleAddSubscription(subscription);
            setShowSubscriptionModal(false);
          }}
          subscribers={subscribers}
          newspapers={newspapers}
        />
      </Modal>

      <footer className="App-footer">
        <p>数据库课程设计 - 订户订阅报刊管理系统</p>
        <p>使用 TypeScript + React + Deno + MySQL 构建</p>
      </footer>
    </div>
  );
}

export default App;
