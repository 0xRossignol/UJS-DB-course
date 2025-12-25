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
    // 在实际应用中，这里会调用API
    const newNewspaper: Newspaper = {
      ...newspaper,
      id: newspapers.length + 1,
      description: newspaper.description || null,
      created_at: new Date(),
      updated_at: new Date()
    };
    setNewspapers([...newspapers, newNewspaper]);
    alert('报刊添加成功！');
  };

  const handleAddSubscription = async (subscription: CreateSubscriptionDTO) => {
    // 在实际应用中，这里会调用API
    const newSubscription: Subscription = {
      ...subscription,
      id: subscriptions.length + 1,
      status: subscription.status || 'active',
      start_date: new Date(subscription.start_date),
      end_date: new Date(subscription.end_date),
      created_at: new Date(),
      updated_at: new Date()
    };
    setSubscriptions([...subscriptions, newSubscription]);
    alert('订阅添加成功！');
  };

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
        <p>一个简单的数据库课程设计项目</p>
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
            <SubscriberList subscribers={subscribers} />
          )}

          {activeTab === 'newspapers' && (
            <NewspaperList newspapers={newspapers} />
          )}

          {activeTab === 'subscriptions' && (
            <SubscriptionList subscriptions={subscriptions} />
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
