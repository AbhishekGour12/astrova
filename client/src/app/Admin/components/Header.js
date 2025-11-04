import { motion } from 'framer-motion';
import { FaSearch, FaFilter, FaBell, FaBars } from 'react-icons/fa';

const Header = ({ searchTerm, setSearchTerm, sidebarOpen, setSidebarOpen }) => {
  return (
    <div className="bg-white/80 backdrop-blur-lg border-b border-[#B2C5B2] shadow-sm">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Desktop Sidebar Toggle */}
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
  );
};

export default Header;