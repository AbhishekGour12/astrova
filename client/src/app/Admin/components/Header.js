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

        

       
      </div>
    </div>
  );
};

export default Header;
