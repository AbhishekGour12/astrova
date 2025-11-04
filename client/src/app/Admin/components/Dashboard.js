import { motion } from 'framer-motion';
import { 
  FaUsers, 
  FaUserAstronaut, 
  FaShoppingBag, 
  FaDollarSign, 
  FaBox, 
  FaComments,
  FaClock,
  FaDownload,
  FaPlus
} from 'react-icons/fa';
import { ChartLoader } from './Loading';

const Dashboard = ({ stats, orders }) => {
  const getStatusColor = (status) => {
    const colors = {
      delivered: 'bg-green-100 text-green-600',
      shipped: 'bg-indigo-100 text-indigo-600',
      pending: 'bg-amber-100 text-amber-600',
      confirmed: 'bg-blue-100 text-blue-600',
      cancelled: 'bg-red-100 text-red-600'
    };
    return colors[status] || 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="space-y-6">
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
    </div>
  );
};

export default Dashboard;