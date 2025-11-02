"use client"
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUsers, 
  FaUserAstronaut, 
  FaShoppingBag, 
  FaDollarSign, 
  FaBox, 
  FaComments,
  FaChartLine,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaSearch,
  FaFilter,
  FaDownload,
  FaUpload,
  FaBell,
  FaUserCircle,
  FaShoppingCart,
  FaCreditCard,
  FaStar,
  FaCheckCircle,
  FaClock,
  FaTruck,
  FaCheck,
  FaTimesCircle,
  FaExclamationTriangle,
  FaShieldAlt
} from 'react-icons/fa';
import {FiMessageSquare} from "react-icons/fi"
import { PageLoader, TableLoader, ChartLoader } from '../components/Loading';

// Dummy data for all sections
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
  const [stats, setStats] = useState(dummyData.stats);
  const [users, setUsers] = useState(dummyData.users);
  const [astrologers, setAstrologers] = useState(dummyData.astrologers);
  const [products, setProducts] = useState(dummyData.products);
  const [orders, setOrders] = useState(dummyData.orders);
  const [payments, setPayments] = useState(dummyData.payments);
  const [chats, setChats] = useState(dummyData.chats);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Simulate API loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Filter functions
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAstrologers = astrologers.filter(astrologer =>
    astrologer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    astrologer.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOrders = orders.filter(order =>
    order.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.orderStatus.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPayments = payments.filter(payment =>
    payment.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredChats = chats.filter(chat =>
    chat.participants.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    chat.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Action handlers
  const deleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(user => user._id !== userId));
    }
  };

  const approveAstrologer = (astrologerId) => {
    setAstrologers(astrologers.map(astrologer =>
      astrologer._id === astrologerId ? { ...astrologer, verified: true } : astrologer
    ));
  };

  const deleteAstrologer = (astrologerId) => {
    if (window.confirm('Are you sure you want to delete this astrologer?')) {
      setAstrologers(astrologers.filter(astrologer => astrologer._id !== astrologerId));
    }
  };

  const deleteProduct = (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setProducts(products.filter(product => product._id !== productId));
    }
  };

  const updateOrderStatus = (orderId, status) => {
    setOrders(orders.map(order =>
      order._id === orderId ? { ...order, orderStatus: status } : order
    ));
  };

  const deleteChat = (chatId) => {
    if (window.confirm('Are you sure you want to delete this chat?')) {
      setChats(chats.filter(chat => chat._id !== chatId));
    }
  };

  const addProduct = (newProduct) => {
    const product = {
      _id: Date.now().toString(),
      ...newProduct,
      sales: 0,
      rating: 4.5
    };
    setProducts([...products, product]);
  };

  if (loading) return <PageLoader />;

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FaChartLine, color: 'from-blue-500 to-cyan-500' },
    { id: 'users', label: 'Users', icon: FaUsers, color: 'from-green-500 to-emerald-500' },
    { id: 'astrologers', label: 'Astrologers', icon: FaUserAstronaut, color: 'from-purple-500 to-pink-500' },
    { id: 'products', label: 'Products', icon: FaShoppingBag, color: 'from-amber-500 to-orange-500' },
    { id: 'orders', label: 'Orders', icon: FaBox, color: 'from-indigo-500 to-purple-500' },
    { id: 'payments', label: 'Payments', icon: FaDollarSign, color: 'from-teal-500 to-green-500' },
    { id: 'chats', label: 'Chats', icon: FaComments, color: 'from-red-500 to-pink-500' },
    { id: 'settings', label: 'Settings', icon: FaCog, color: 'from-gray-500 to-gray-700' },
  ];

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-600',
      inactive: 'bg-gray-100 text-gray-600',
      online: 'bg-green-100 text-green-600',
      offline: 'bg-gray-100 text-gray-600',
      busy: 'bg-amber-100 text-amber-600',
      pending: 'bg-amber-100 text-amber-600',
      confirmed: 'bg-blue-100 text-blue-600',
      shipped: 'bg-indigo-100 text-indigo-600',
      delivered: 'bg-green-100 text-green-600',
      cancelled: 'bg-red-100 text-red-600',
      completed: 'bg-green-100 text-green-600',
      failed: 'bg-red-100 text-red-600'
    };
    return colors[status] || 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F3E9] via-[#ECE5D3] to-[#F7F3E9]">
      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="w-12 h-12 bg-gradient-to-r from-[#C06014] to-[#D47C3A] text-white rounded-2xl flex items-center justify-center shadow-lg"
        >
          {sidebarOpen ? <FaTimes /> : <FaBars />}
        </motion.button>
      </div>

      <div className="flex">
        {/* Sidebar - Always visible on desktop, hidden on mobile */}
        <motion.div
          initial={false}
          animate={{ 
            x: sidebarOpen ? 0 : -300
          }}
          className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white/95 backdrop-blur-lg border-r border-[#B2C5B2] transform transition-transform duration-300 h-screen ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="p-6 border-b border-[#B2C5B2]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#C06014] to-[#D47C3A] rounded-2xl flex items-center justify-center shadow-lg">
                <FaChartLine className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#003D33]">Cosmic Admin</h1>
                <p className="text-sm text-[#00695C]">Divine Management</p>
              </div>
            </div>
          </div>

          <nav className="p-4 space-y-2">
            {menuItems.map((item) => (
              <motion.button
                key={item.id}
                whileHover={{ x: 4 }}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(true);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all duration-300 group ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-[#C06014] to-[#D47C3A] text-white shadow-lg'
                    : 'text-[#003D33] hover:bg-[#ECE5D3] hover:text-[#C06014]'
                }`}
              >
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform ${
                  activeTab === item.id ? 'bg-white/20' : `bg-gradient-to-r ${item.color} text-white`
                }`}>
                  <item.icon className="text-lg" />
                </div>
                <span className="font-medium">{item.label}</span>
              </motion.button>
            ))}
          </nav>

          <div className="absolute bottom-4 left-4 right-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[#003D33] hover:bg-red-50 hover:text-red-600 transition-all duration-300 border border-[#B2C5B2]"
            >
              <FaSignOutAlt />
              <span className="font-medium">Logout</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 min-h-screen lg:ml-0">
          {/* Top Bar */}
          <div className="bg-white/80 backdrop-blur-lg border-b border-[#B2C5B2] shadow-sm">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Desktop Sidebar Toggle - Hidden on desktop since sidebar is always visible */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="hidden lg:flex w-12 h-12 bg-gradient-to-r from-[#C06014] to-[#D47C3A] text-white rounded-2xl items-center justify-center shadow-lg"
                  >
                    <FaBars />
                  </motion.button>
                  
                  <div className="flex items-center gap-4 flex-1 max-w-2xl">
                    <div className="relative flex-1">
                      <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#00695C]" />
                      <input
                        type="text"
                        placeholder="Search across cosmos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-[#F7F3E9] border border-[#B2C5B2] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#C06014] text-[#003D33] placeholder-[#00695C]/60"
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      className="p-3 bg-[#ECE5D3] hover:bg-[#C06014] hover:text-white rounded-2xl transition-all duration-300 border border-[#B2C5B2]"
                    >
                      <FaFilter />
                    </motion.button>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <motion.button whileHover={{ scale: 1.1 }} className="relative p-3 text-[#00695C] hover:text-[#C06014]">
                    <FaBell />
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
                  </motion.button>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-[#C06014] to-[#D47C3A] rounded-2xl flex items-center justify-center text-white font-semibold">
                      A
                    </div>
                    <div className="hidden sm:block">
                      <p className="font-semibold text-[#003D33]">Admin User</p>
                      <p className="text-sm text-[#00695C]">Super Admin</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Page Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {/* Dashboard Tab */}
            
              {activeTab === 'dashboard' && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-bold text-[#003D33]">Cosmic Dashboard</h2>
                      <p className="text-[#00695C]">Welcome to your spiritual management center</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-[#B2C5B2] rounded-2xl text-[#003D33] hover:bg-[#ECE5D3] transition-colors"
                      >
                        <FaDownload />
                        Export
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#C06014] to-[#D47C3A] text-white rounded-2xl"
                      >
                        <FaPlus />
                        New Report
                      </motion.button>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { icon: FaUsers, label: 'Total Users', value: stats.usersCount, change: '+12%', color: 'from-blue-500 to-cyan-500' },
                      { icon: FaUserAstronaut, label: 'Astrologers', value: stats.astrologersCount, change: '+5%', color: 'from-purple-500 to-pink-500' },
                      { icon: FaShoppingBag, label: 'Products', value: stats.productsCount, change: '+8%', color: 'from-green-500 to-emerald-500' },
                      { icon: FaDollarSign, label: 'Revenue', value: `$${stats.totalRevenue}`, change: '+23%', color: 'from-amber-500 to-orange-500' },
                    ].map((stat, index) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -5 }}
                        className="bg-white rounded-3xl p-6 border border-[#B2C5B2] shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center`}>
                            <stat.icon className="text-white text-xl" />
                          </div>
                          <span className="text-sm font-semibold text-green-500 bg-green-50 px-2 py-1 rounded-full">
                            {stat.change}
                          </span>
                        </div>
                        <h3 className="text-2xl font-bold text-[#003D33] mb-1">{stat.value}</h3>
                        <p className="text-[#00695C]">{stat.label}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Additional Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { icon: FaBox, label: 'Total Orders', value: stats.totalOrders, color: 'from-indigo-500 to-purple-500' },
                      { icon: FaClock, label: 'Pending Orders', value: stats.pendingOrders, color: 'from-amber-500 to-orange-500' },
                      { icon: FaComments, label: 'Active Chats', value: stats.activeChats, color: 'from-teal-500 to-green-500' },
                    ].map((stat, index) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="bg-white rounded-3xl p-6 border border-[#B2C5B2] shadow-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-16 h-16 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center`}>
                            <stat.icon className="text-white text-2xl" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-[#003D33]">{stat.value}</h3>
                            <p className="text-[#00695C]">{stat.label}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Charts and Recent Activity */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Revenue Chart */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-white rounded-3xl p-6 border border-[#B2C5B2] shadow-lg"
                    >
                      <h3 className="text-xl font-bold text-[#003D33] mb-4">Revenue Overview</h3>
                      <div className="h-64 flex items-center justify-center bg-gradient-to-br from-[#F7F3E9] to-[#ECE5D3] rounded-2xl">
                        <ChartLoader />
                      </div>
                    </motion.div>

                    {/* Recent Orders */}
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-white rounded-3xl p-6 border border-[#B2C5B2] shadow-lg"
                    >
                      <h3 className="text-xl font-bold text-[#003D33] mb-4">Recent Orders</h3>
                      <div className="space-y-3">
                        {orders.slice(0, 5).map((order) => (
                          <div key={order._id} className="flex items-center justify-between p-3 bg-[#F7F3E9] rounded-2xl hover:bg-[#ECE5D3] transition-colors">
                            <div>
                              <p className="font-semibold text-[#003D33]">Order #{order._id}</p>
                              <p className="text-sm text-[#00695C]">{order.user.name}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[#C06014] font-bold">${order.totalAmount}</p>
                              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.orderStatus)}`}>
                                {order.orderStatus}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {/* Users Tab */}
              {activeTab === 'users' && (
                <motion.div
                  key="users"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-3xl font-bold text-[#003D33]">User Management</h2>
                      <p className="text-[#00695C]">Manage your cosmic community members</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[#00695C] bg-[#ECE5D3] px-3 py-1 rounded-full">
                        {filteredUsers.length} users
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-gradient-to-r from-[#C06014] to-[#D47C3A] text-white px-6 py-3 rounded-2xl font-semibold flex items-center gap-2"
                      >
                        <FaPlus />
                        Add User
                      </motion.button>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl border border-[#B2C5B2] overflow-hidden shadow-lg">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gradient-to-r from-[#ECE5D3] to-[#F7F3E9]">
                          <tr>
                            <th className="px-6 py-4 text-left text-[#003D33] font-semibold">User</th>
                            <th className="px-6 py-4 text-left text-[#003D33] font-semibold">Email</th>
                            <th className="px-6 py-4 text-left text-[#003D33] font-semibold">Status</th>
                            <th className="px-6 py-4 text-left text-[#003D33] font-semibold">Orders</th>
                            <th className="px-6 py-4 text-left text-[#003D33] font-semibold">Last Active</th>
                            <th className="px-6 py-4 text-left text-[#003D33] font-semibold">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#B2C5B2]">
                          {filteredUsers.map((user) => (
                            <motion.tr
                              key={user._id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="hover:bg-[#F7F3E9] transition-colors"
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-gradient-to-br from-[#C06014] to-[#D47C3A] rounded-2xl flex items-center justify-center text-white font-semibold">
                                    {user.name.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-[#003D33]">{user.name}</p>
                                    <p className="text-sm text-[#00695C]">Joined {new Date(user.createdAt).toLocaleDateString()}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-[#00695C]">{user.email}</td>
                              <td className="px-6 py-4">
                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(user.status)}`}>
                                  {user.status}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-[#003D33] font-semibold">{user.orders}</span>
                              </td>
                              <td className="px-6 py-4 text-[#00695C]">{user.lastActive}</td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-2xl transition-colors"
                                    title="View Details"
                                  >
                                    <FaEye />
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="p-2 text-amber-500 hover:bg-amber-50 rounded-2xl transition-colors"
                                    title="Edit User"
                                  >
                                    <FaEdit />
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => deleteUser(user._id)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-2xl transition-colors"
                                    title="Delete User"
                                  >
                                    <FaTrash />
                                  </motion.button>
                                </div>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Astrologers Tab */}
              {activeTab === 'astrologers' && (
                <motion.div
                  key="astrologers"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-3xl font-bold text-[#003D33]">Astrologer Management</h2>
                      <p className="text-[#00695C]">Manage your divine guidance providers</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[#00695C] bg-[#ECE5D3] px-3 py-1 rounded-full">
                        {filteredAstrologers.length} astrologers
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-gradient-to-r from-[#C06014] to-[#D47C3A] text-white px-6 py-3 rounded-2xl font-semibold flex items-center gap-2"
                      >
                        <FaPlus />
                        Add Astrologer
                      </motion.button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAstrologers.map((astrologer) => (
                      <motion.div
                        key={astrologer._id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ y: -5 }}
                        className="bg-white rounded-3xl border border-[#B2C5B2] p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <div className="flex items-center gap-4 mb-4">
                          <div className="relative">
                            <div className="w-16 h-16 bg-gradient-to-br from-[#C06014] to-[#D47C3A] rounded-2xl flex items-center justify-center text-white text-xl font-semibold">
                              {astrologer.name.charAt(0)}
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(astrologer.status)}`} />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-[#003D33] text-lg">{astrologer.name}</h3>
                            <p className="text-[#00695C] text-sm">{astrologer.specialty}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex items-center gap-1 text-amber-400">
                                <FaStar className="text-sm" />
                                <span className="text-[#003D33] text-sm font-semibold">{astrologer.rating}</span>
                              </div>
                              <span className="text-[#00695C] text-sm">• {astrologer.clients} clients</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between items-center">
                            <span className="text-[#00695C] text-sm">Experience:</span>
                            <span className="text-[#003D33] font-semibold text-sm">{astrologer.experience}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[#00695C] text-sm">Verification:</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              astrologer.verified 
                                ? 'bg-green-100 text-green-600' 
                                : 'bg-amber-100 text-amber-600'
                            }`}>
                              {astrologer.verified ? 'Verified' : 'Pending'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[#00695C] text-sm">Status:</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(astrologer.status)}`}>
                              {astrologer.status}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {!astrologer.verified && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => approveAstrologer(astrologer._id)}
                              className="flex-1 bg-green-500 text-white py-2 rounded-2xl text-sm font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                            >
                              <FaCheckCircle />
                              Approve
                            </motion.button>
                          )}
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => deleteAstrologer(astrologer._id)}
                            className={`${astrologer.verified ? 'flex-1' : 'px-4'} bg-red-500 text-white py-2 rounded-2xl text-sm font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2`}
                          >
                            <FaTrash />
                            {astrologer.verified ? 'Delete' : ''}
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Products Tab */}
              {activeTab === 'products' && (
                <motion.div
                  key="products"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-3xl font-bold text-[#003D33]">Product Management</h2>
                      <p className="text-[#00695C]">Manage your spiritual products inventory</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[#00695C] bg-[#ECE5D3] px-3 py-1 rounded-full">
                        {filteredProducts.length} products
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-gradient-to-r from-[#C06014] to-[#D47C3A] text-white px-6 py-3 rounded-2xl font-semibold flex items-center gap-2"
                      >
                        <FaPlus />
                        Add Product
                      </motion.button>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl border border-[#B2C5B2] overflow-hidden shadow-lg">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gradient-to-r from-[#ECE5D3] to-[#F7F3E9]">
                          <tr>
                            <th className="px-6 py-4 text-left text-[#003D33] font-semibold">Product</th>
                            <th className="px-6 py-4 text-left text-[#003D33] font-semibold">Category</th>
                            <th className="px-6 py-4 text-left text-[#003D33] font-semibold">Price</th>
                            <th className="px-6 py-4 text-left text-[#003D33] font-semibold">Stock</th>
                            <th className="px-6 py-4 text-left text-[#003D33] font-semibold">Sales</th>
                            <th className="px-6 py-4 text-left text-[#003D33] font-semibold">Rating</th>
                            <th className="px-6 py-4 text-left text-[#003D33] font-semibold">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#B2C5B2]">
                          {filteredProducts.map((product) => (
                            <motion.tr
                              key={product._id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="hover:bg-[#F7F3E9] transition-colors"
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-gradient-to-br from-[#C06014] to-[#D47C3A] rounded-2xl flex items-center justify-center text-white font-semibold">
                                    {product.name.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-[#003D33]">{product.name}</p>
                                    <p className="text-sm text-[#00695C]">
                                      {product.isFeatured && (
                                        <span className="text-amber-500">★ Featured</span>
                                      )}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-[#00695C]">{product.category}</td>
                              <td className="px-6 py-4">
                                <span className="text-[#003D33] font-semibold">${product.price}</span>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                  product.stock > 10 ? 'bg-green-100 text-green-600' : 
                                  product.stock > 0 ? 'bg-amber-100 text-amber-600' : 
                                  'bg-red-100 text-red-600'
                                }`}>
                                  {product.stock} in stock
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-[#003D33] font-semibold">{product.sales}</span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-1">
                                  <FaStar className="text-amber-400 text-sm" />
                                  <span className="text-[#003D33] font-semibold">{product.rating}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-2xl transition-colors"
                                    title="View Details"
                                  >
                                    <FaEye />
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="p-2 text-amber-500 hover:bg-amber-50 rounded-2xl transition-colors"
                                    title="Edit Product"
                                  >
                                    <FaEdit />
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => deleteProduct(product._id)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-2xl transition-colors"
                                    title="Delete Product"
                                  >
                                    <FaTrash />
                                  </motion.button>
                                </div>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <motion.div
                  key="orders"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-3xl font-bold text-[#003D33]">Order Management</h2>
                      <p className="text-[#00695C]">Manage customer orders and fulfillment</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[#00695C] bg-[#ECE5D3] px-3 py-1 rounded-full">
                        {filteredOrders.length} orders
                      </span>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl border border-[#B2C5B2] overflow-hidden shadow-lg">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gradient-to-r from-[#ECE5D3] to-[#F7F3E9]">
                          <tr>
                            <th className="px-6 py-4 text-left text-[#003D33] font-semibold">Order ID</th>
                            <th className="px-6 py-4 text-left text-[#003D33] font-semibold">Customer</th>
                            <th className="px-6 py-4 text-left text-[#003D33] font-semibold">Date</th>
                            <th className="px-6 py-4 text-left text-[#003D33] font-semibold">Items</th>
                            <th className="px-6 py-4 text-left text-[#003D33] font-semibold">Amount</th>
                            <th className="px-6 py-4 text-left text-[#003D33] font-semibold">Status</th>
                            <th className="px-6 py-4 text-left text-[#003D33] font-semibold">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#B2C5B2]">
                          {filteredOrders.map((order) => (
                            <motion.tr
                              key={order._id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="hover:bg-[#F7F3E9] transition-colors"
                            >
                              <td className="px-6 py-4">
                                <span className="font-semibold text-[#003D33]">#{order._id}</span>
                              </td>
                              <td className="px-6 py-4">
                                <div>
                                  <p className="font-semibold text-[#003D33]">{order.user.name}</p>
                                  <p className="text-sm text-[#00695C]">{order.user.email}</p>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-[#00695C]">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-[#003D33] font-semibold">{order.items}</span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-[#C06014] font-bold">${order.totalAmount}</span>
                              </td>
                              <td className="px-6 py-4">
                                <select
                                  value={order.orderStatus}
                                  onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                  className={`px-3 py-1 rounded-full text-sm font-semibold border-none outline-none ${getStatusColor(order.orderStatus)}`}
                                >
                                  <option value="pending">Pending</option>
                                  <option value="confirmed">Confirmed</option>
                                  <option value="shipped">Shipped</option>
                                  <option value="delivered">Delivered</option>
                                  <option value="cancelled">Cancelled</option>
                                </select>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-2xl transition-colors"
                                    title="View Details"
                                  >
                                    <FaEye />
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="p-2 text-green-500 hover:bg-green-50 rounded-2xl transition-colors"
                                    title="Track Order"
                                  >
                                    <FaTruck />
                                  </motion.button>
                                </div>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Payments Tab */}
              {activeTab === 'payments' && (
                <motion.div
                  key="payments"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-3xl font-bold text-[#003D33]">Payment Management</h2>
                      <p className="text-[#00695C]">Monitor and manage payment transactions</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[#00695C] bg-[#ECE5D3] px-3 py-1 rounded-full">
                        {filteredPayments.length} payments
                      </span>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl border border-[#B2C5B2] overflow-hidden shadow-lg">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gradient-to-r from-[#ECE5D3] to-[#F7F3E9]">
                          <tr>
                            <th className="px-6 py-4 text-left text-[#003D33] font-semibold">Order ID</th>
                            <th className="px-6 py-4 text-left text-[#003D33] font-semibold">Amount</th>
                            <th className="px-6 py-4 text-left text-[#003D33] font-semibold">Method</th>
                            <th className="px-6 py-4 text-left text-[#003D33] font-semibold">Date</th>
                            <th className="px-6 py-4 text-left text-[#003D33] font-semibold">Status</th>
                            <th className="px-6 py-4 text-left text-[#003D33] font-semibold">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#B2C5B2]">
                          {filteredPayments.map((payment) => (
                            <motion.tr
                              key={payment._id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="hover:bg-[#F7F3E9] transition-colors"
                            >
                              <td className="px-6 py-4">
                                <span className="font-semibold text-[#003D33]">{payment.orderId}</span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-[#C06014] font-bold">${payment.amount}</span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-[#00695C] capitalize">{payment.method.replace('_', ' ')}</span>
                              </td>
                              <td className="px-6 py-4 text-[#00695C]">
                                {new Date(payment.createdAt).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(payment.status)}`}>
                                  {payment.status}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-2xl transition-colors"
                                    title="View Details"
                                  >
                                    <FaEye />
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="p-2 text-amber-500 hover:bg-amber-50 rounded-2xl transition-colors"
                                    title="Refund"
                                  >
                                    <FaCreditCard />
                                  </motion.button>
                                </div>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Chats Tab */}
              {activeTab === 'chats' && (
                <motion.div
                  key="chats"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-3xl font-bold text-[#003D33]">Chat Management</h2>
                      <p className="text-[#00695C]">Monitor conversations between users and astrologers</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[#00695C] bg-[#ECE5D3] px-3 py-1 rounded-full">
                        {filteredChats.length} active chats
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredChats.map((chat) => (
                      <motion.div
                        key={chat._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -5 }}
                        className="bg-white rounded-3xl border border-[#B2C5B2] p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-bold text-[#003D33] text-lg">
                              {chat.participants.map(p => p.name).join(' & ')}
                            </h3>
                            <p className="text-[#00695C] text-sm">
                              Last activity: {new Date(chat.lastMessageTime).toLocaleDateString()}
                            </p>
                          </div>
                          {chat.unread > 0 && (
                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                              {chat.unread} new
                            </span>
                          )}
                        </div>

                        <div className="mb-4">
                          <p className="text-[#003D33] line-clamp-2">
                            {chat.lastMessage}
                          </p>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="bg-blue-500 text-white px-4 py-2 rounded-2xl text-sm font-semibold hover:bg-blue-600 transition-colors flex items-center gap-2"
                            >
                              <FaEye />
                              View Chat
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="bg-green-500 text-white px-4 py-2 rounded-2xl text-sm font-semibold hover:bg-green-600 transition-colors flex items-center gap-2"
                            >
                              <FiMessageSquare />
                              Join
                            </motion.button>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => deleteChat(chat._id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-2xl transition-colors"
                            title="Delete Chat"
                          >
                            <FaTrash />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-3xl font-bold text-[#003D33]">Settings</h2>
                      <p className="text-[#00695C]">Configure your cosmic administration panel</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* General Settings */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-white rounded-3xl border border-[#B2C5B2] p-6 shadow-lg"
                    >
                      <h3 className="text-xl font-bold text-[#003D33] mb-4 flex items-center gap-2">
                        <FaCog className="text-[#C06014]" />
                        General Settings
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[#003D33] font-semibold mb-2">Site Name</label>
                          <input
                            type="text"
                            defaultValue="Cosmic Connections"
                            className="w-full px-4 py-3 bg-[#F7F3E9] border border-[#B2C5B2] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#C06014] text-[#003D33]"
                          />
                        </div>
                        <div>
                          <label className="block text-[#003D33] font-semibold mb-2">Admin Email</label>
                          <input
                            type="email"
                            defaultValue="admin@cosmic.com"
                            className="w-full px-4 py-3 bg-[#F7F3E9] border border-[#B2C5B2] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#C06014] text-[#003D33]"
                          />
                        </div>
                        <div>
                          <label className="block text-[#003D33] font-semibold mb-2">Timezone</label>
                          <select className="w-full px-4 py-3 bg-[#F7F3E9] border border-[#B2C5B2] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#C06014] text-[#003D33]">
                            <option>UTC</option>
                            <option>EST</option>
                            <option>PST</option>
                          </select>
                        </div>
                      </div>
                    </motion.div>

                    {/* Security Settings */}
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-white rounded-3xl border border-[#B2C5B2] p-6 shadow-lg"
                    >
                      <h3 className="text-xl font-bold text-[#003D33] mb-4 flex items-center gap-2">
                        <FaShieldAlt className="text-[#C06014]" />
                        Security Settings
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-[#F7F3E9] rounded-2xl">
                          <div>
                            <p className="font-semibold text-[#003D33]">Two-Factor Authentication</p>
                            <p className="text-sm text-[#00695C]">Add an extra layer of security</p>
                          </div>
                          <button className="bg-gradient-to-r from-[#C06014] to-[#D47C3A] text-white px-4 py-2 rounded-2xl text-sm font-semibold">
                            Enable
                          </button>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-[#F7F3E9] rounded-2xl">
                          <div>
                            <p className="font-semibold text-[#003D33]">Session Timeout</p>
                            <p className="text-sm text-[#00695C]">Auto-logout after 30 minutes</p>
                          </div>
                          <button className="bg-gray-500 text-white px-4 py-2 rounded-2xl text-sm font-semibold">
                            Change
                          </button>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-[#F7F3E9] rounded-2xl">
                          <div>
                            <p className="font-semibold text-[#003D33]">Login Notifications</p>
                            <p className="text-sm text-[#00695C]">Get alerts for new logins</p>
                          </div>
                          <button className="bg-gradient-to-r from-[#C06014] to-[#D47C3A] text-white px-4 py-2 rounded-2xl text-sm font-semibold">
                            Enabled
                          </button>
                        </div>
                      </div>
                    </motion.div>

                    {/* Save Settings Button */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="lg:col-span-2 flex justify-end"
                    >
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-gradient-to-r from-[#C06014] to-[#D47C3A] text-white px-8 py-4 rounded-2xl font-semibold text-lg flex items-center gap-2"
                      >
                        <FaCheck />
                        Save All Changes
                      </motion.button>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;