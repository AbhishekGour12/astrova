import { motion } from 'framer-motion';
import {
  FaChartLine,
  FaUsers,
  FaUserAstronaut,
  FaShoppingBag,
  FaBox,
  FaRupeeSign,
  FaComments,
  FaCog,
  FaSignOutAlt,
  FaGift,
  FaTimes, // Added Close Icon
} from 'react-icons/fa';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: FaChartLine },
  { id: 'users', label: 'Users', icon: FaUsers },
  { id: 'astrologers', label: 'Astrologers', icon: FaUserAstronaut },
  { id: 'products', label: 'Products', icon: FaShoppingBag },
  { id: 'orders', label: 'Orders', icon: FaBox },
  { id: 'payments', label: 'Payments', icon: FaRupeeSign },
  { id: 'chats', label: 'Chats', icon: FaComments },
  { id: 'coupon', label: 'Coupon', icon: FaGift },
  { id: 'settings', label: 'Settings', icon: FaCog },
];

const Sidebar = ({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen }) => {
  return (
    <motion.div
      initial={{ x: -260 }}
      animate={{ x: sidebarOpen ? 0 : -260 }}
      transition={{ duration: 0.3 }}
      className={`fixed lg:static top-0 left-0 h-screen bg-white shadow-lg z-40
      w-64 border-r border-gray-300 
      ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      lg:translate-x-0 lg:block`}
    >

      {/* TOP HEADER WITH CLOSE BUTTON */}
      <div className="p-6 border-b bg-[#FFF3E9] flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-[#C06014]">MY ASTROVA</h1>
          <p className="text-sm text-gray-700">Divine Management</p>
        </div>

        {/* Close Button - ONLY MOBILE */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden text-[#C06014] hover:text-red-500 transition text-xl"
        >
          <FaTimes />
        </button>
      </div>

      <nav className="p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              setSidebarOpen(false); // Auto close sidebar on mobile when clicking
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition
            ${activeTab === item.id
                ? "bg-[#C06014] text-white shadow-md"
                : "hover:bg-gray-100 text-gray-700"
              }`}
          >
            <item.icon />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="absolute bottom-4 left-4 right-4">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl 
        hover:bg-red-50 text-red-600 border border-gray-300">
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </motion.div>
  );
};

export default Sidebar;
