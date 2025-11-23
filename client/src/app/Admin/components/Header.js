import { FaBars, FaSearch, FaBell } from "react-icons/fa";
import { motion } from "framer-motion";

const Header = ({ sidebarOpen, setSidebarOpen, setSearchTerm }) => {
  return (
    <div className="bg-white/90 backdrop-blur-lg px-6 py-3 border-b sticky top-0 z-20">
      <div className="flex justify-between items-center gap-4">
        
        {/* Mobile toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden text-[#C06014]"
        >
          <FaBars size={22} />
        </button>

        {/* Search */}
        <div className="flex-1 relative max-w-xl ">
          <FaSearch className="absolute left-3 top-3 text-gray-500" size={16} />
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-100 outline-none"
          />
        </div>

        {/* Notification */}
        <motion.button whileHover={{ scale: 1.1 }}>
          <FaBell className="text-[#C06014]" size={22} />
        </motion.button>
      </div>
    </div>
  );
};

export default Header;
