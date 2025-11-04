import { motion } from 'framer-motion';
import { 
  FaChartLine, 
  FaUsers, 
  FaUserAstronaut, 
  FaShoppingBag, 
  FaBox, 
  FaDollarSign, 
  FaComments,
  FaCog,
  FaSignOutAlt
} from 'react-icons/fa';

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

const Sidebar = ({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen }) => {
  return (
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
  );
};

export default Sidebar;