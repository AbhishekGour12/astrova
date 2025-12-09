"use client"
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Header from './components/Header'
import Dashboard from './components/Dashboard';
import UsersTab from './components/UsersTab';
import AstrologersTab from './components/AstrologersTab';
import ProductsTab from './components/ProductsTab';
import OrdersTab from './components/OrdersTab';
import PaymentsTab from './components/PaymentsTab';
import ChatsTab from './components/ChatsTab';
import SettingsTab from './components/SettingsTab';
import { PageLoader } from './components/Loading';
import { FaBars, FaTimes } from 'react-icons/fa';
import CouponsTab from './components/CouponsTab';

// Dummy data (move to separate file if needed)
const dummyData = {
  stats: {
    usersCount: 1247,
    astrologersCount: 48,
    productsCount: 156,
    totalOrders: 892,
    totalRevenue: 45230,
    pendingOrders: 23,
    activeChats: 67
  },
  users: [
    { _id: '1', name: 'Alice Johnson', email: 'alice@example.com', createdAt: '2024-01-15', status: 'active', orders: 5, lastActive: '2 hours ago' },
    { _id: '2', name: 'Bob Smith', email: 'bob@example.com', createdAt: '2024-01-10', status: 'active', orders: 12, lastActive: '1 day ago' },
    { _id: '3', name: 'Carol Davis', email: 'carol@example.com', createdAt: '2024-01-08', status: 'inactive', orders: 3, lastActive: '1 week ago' },
    { _id: '4', name: 'David Wilson', email: 'david@example.com', createdAt: '2024-01-05', status: 'active', orders: 8, lastActive: '3 hours ago' },
    { _id: '5', name: 'Eva Brown', email: 'eva@example.com', createdAt: '2024-01-03', status: 'active', orders: 15, lastActive: '30 minutes ago' }
  ],
  astrologers: [
    { _id: '1', name: 'Master Raj', specialty: 'Vedic Astrology', experience: '20+ years', rating: 4.9, verified: true, clients: 234, status: 'online' },
    { _id: '2', name: 'Priya Sharma', specialty: 'Love & Relationships', experience: '15+ years', rating: 4.8, verified: true, clients: 189, status: 'online' },
    { _id: '3', name: 'Dr. Arjun', specialty: 'Career Guidance', experience: '12+ years', rating: 4.7, verified: false, clients: 156, status: 'offline' },
    { _id: '4', name: 'Luna Moon', specialty: 'Tarot Reading', experience: '8+ years', rating: 4.6, verified: true, clients: 98, status: 'online' },
    { _id: '5', name: 'Sage Wisdom', specialty: 'Spiritual Healing', experience: '25+ years', rating: 4.9, verified: true, clients: 312, status: 'busy' }
  ],
  products: [
    { _id: '1', name: 'Healing Crystal Set', price: 49.99, stock: 15, category: 'Crystals', isFeatured: true, sales: 89, rating: 4.8 },
    { _id: '2', name: 'Zodiac Birthstone Bracelet', price: 34.99, stock: 8, category: 'Jewelry', isFeatured: false, sales: 45, rating: 4.6 },
    { _id: '3', name: 'Ancient Tarot Card Deck', price: 39.99, stock: 20, category: 'Spiritual Tools', isFeatured: true, sales: 127, rating: 4.9 },
    { _id: '4', name: 'Meditation Yantra Set', price: 29.99, stock: 12, category: 'Meditation', isFeatured: false, sales: 34, rating: 4.7 },
    { _id: '5', name: 'Aura Cleansing Kit', price: 59.99, stock: 5, category: 'Wellness', isFeatured: true, sales: 67, rating: 4.8 }
  ],
  orders: [
    { _id: '1', user: { name: 'Alice Johnson', email: 'alice@example.com' }, totalAmount: 149.97, orderStatus: 'delivered', createdAt: '2024-01-15', items: 3 },
    { _id: '2', user: { name: 'Bob Smith', email: 'bob@example.com' }, totalAmount: 84.98, orderStatus: 'shipped', createdAt: '2024-01-14', items: 2 },
    { _id: '3', user: { name: 'Carol Davis', email: 'carol@example.com' }, totalAmount: 39.99, orderStatus: 'pending', createdAt: '2024-01-14', items: 1 },
    { _id: '4', user: { name: 'David Wilson', email: 'david@example.com' }, totalAmount: 124.97, orderStatus: 'confirmed', createdAt: '2024-01-13', items: 4 },
    { _id: '5', user: { name: 'Eva Brown', email: 'eva@example.com' }, totalAmount: 69.98, orderStatus: 'cancelled', createdAt: '2024-01-12', items: 2 }
  ],
  payments: [
    { _id: '1', orderId: 'ORD001', amount: 149.97, status: 'completed', method: 'credit_card', createdAt: '2024-01-15' },
    { _id: '2', orderId: 'ORD002', amount: 84.98, status: 'completed', method: 'paypal', createdAt: '2024-01-14' },
    { _id: '3', orderId: 'ORD003', amount: 39.99, status: 'pending', method: 'credit_card', createdAt: '2024-01-14' },
    { _id: '4', orderId: 'ORD004', amount: 124.97, status: 'completed', method: 'stripe', createdAt: '2024-01-13' },
    { _id: '5', orderId: 'ORD005', amount: 69.98, status: 'failed', method: 'paypal', createdAt: '2024-01-12' }
  ],
  chats: [
    { _id: '1', participants: [{ name: 'Alice Johnson' }, { name: 'Master Raj' }], lastMessage: 'Thank you for the guidance!', lastMessageTime: '2024-01-15T10:30:00Z', unread: 0 },
    { _id: '2', participants: [{ name: 'Bob Smith' }, { name: 'Priya Sharma' }], lastMessage: 'When is the best time for career change?', lastMessageTime: '2024-01-15T09:15:00Z', unread: 2 },
    { _id: '3', participants: [{ name: 'Eva Brown' }, { name: 'Luna Moon' }], lastMessage: 'The tarot reading was amazing!', lastMessageTime: '2024-01-14T16:45:00Z', unread: 0 },
    { _id: '4', participants: [{ name: 'David Wilson' }, { name: 'Sage Wisdom' }], lastMessage: 'Looking forward to our session', lastMessageTime: '2024-01-14T14:20:00Z', unread: 1 }
  ]
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState(dummyData);

  useEffect(() => {
    document.getElementById("navbar").style.display = "none"
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Action handlers
  const deleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setData(prev => ({
        ...prev,
        users: prev.users.filter(user => user._id !== userId)
      }));
    }
  };

  const approveAstrologer = (astrologerId) => {
    setData(prev => ({
      ...prev,
      astrologers: prev.astrologers.map(astrologer =>
        astrologer._id === astrologerId ? { ...astrologer, verified: true } : astrologer
      )
    }));
  };

  const deleteAstrologer = (astrologerId) => {
    if (window.confirm('Are you sure you want to delete this astrologer?')) {
      setData(prev => ({
        ...prev,
        astrologers: prev.astrologers.filter(astrologer => astrologer._id !== astrologerId)
      }));
    }
  };

  const deleteProduct = (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setData(prev => ({
        ...prev,
        products: prev.products.filter(product => product._id !== productId)
      }));
    }
  };

  const updateOrderStatus = (orderId, status) => {
    setData(prev => ({
      ...prev,
      orders: prev.orders.map(order =>
        order._id === orderId ? { ...order, orderStatus: status } : order
      )
    }));
  };

  const deleteChat = (chatId) => {
    if (window.confirm('Are you sure you want to delete this chat?')) {
      setData(prev => ({
        ...prev,
        chats: prev.chats.filter(chat => chat._id !== chatId)
      }));
    }
  };

  if (loading) return <PageLoader />;

  const tabComponents = {
    dashboard: <Dashboard stats={data.stats} orders={data.orders} />,
    users: <UsersTab 
      users={data.users} 
      searchTerm={searchTerm} 
      onDeleteUser={deleteUser} 
    />,
    astrologers: <AstrologersTab 
      astrologers={data.astrologers} 
      searchTerm={searchTerm} 
      onApproveAstrologer={approveAstrologer}
      onDeleteAstrologer={deleteAstrologer}
    />,
    products: <ProductsTab 
      products={data.products} 
      searchTerm={searchTerm} 
      onDeleteProduct={deleteProduct}
    />,
    orders: <OrdersTab 
      orders={data.orders} 
      searchTerm={searchTerm} 
      onUpdateOrderStatus={updateOrderStatus}
    />,
    payments: <PaymentsTab 
      payments={data.payments} 
      searchTerm={searchTerm} 
    />,
    chats: <ChatsTab 
      chats={data.chats} 
      searchTerm={searchTerm} 
      onDeleteChat={deleteChat}
    />,
    coupon: <CouponsTab/>,
    settings: <SettingsTab />
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F3E9] via-[#ECE5D3] to-[#F7F3E9]">
      

      <div className="flex">
        <Sidebar 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
           onClick={() => {
  setActiveTab(item.id);

  // Close ONLY on mobile
  if (window.innerWidth < 1024) {
    setSidebarOpen(false);
  }
}}

          />
        )}

        {/* Main Content */}
        <div className="flex-1 min-h-screen lg:ml-0">
          <Header
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />

          {/* Page Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {tabComponents[activeTab]}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;