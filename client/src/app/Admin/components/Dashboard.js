import { motion } from "framer-motion";
import {
  FaUsers,
  FaUserAstronaut,
  FaShoppingBag,
  FaDollarSign,
  FaBox,
  FaComments,
  FaClock,
  FaDownload,
  FaPlus,
  FaRupeeSign,
} from "react-icons/fa";
import { ChartLoader } from "./Loading";

const Dashboard = ({ stats, orders }) => {
  const statusColor = {
    delivered: "bg-green-100 text-green-700",
    shipped: "bg-indigo-100 text-indigo-700",
    pending: "bg-amber-100 text-amber-700",
    confirmed: "bg-blue-100 text-blue-700",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-6">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#003D33]">
            Cosmic Dashboard
          </h2>
          <p className="text-[#00695C] text-sm sm:text-base">
            Welcome to your spiritual management center
          </p>
        </div>

        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border rounded-xl text-sm sm:text-base 
              border-gray-300 text-[#003D33] hover:bg-[#ECE5D3]"
          >
            <FaDownload className="text-sm" />
            Export
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 
              bg-gradient-to-r from-[#C06014] to-[#D47C3A] text-white rounded-xl 
              text-sm sm:text-base"
          >
            <FaPlus className="text-sm" />
            New Report
          </motion.button>
        </div>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {[
          { icon: FaUsers, value: stats.usersCount, label: "Users", color: "from-blue-500 to-cyan-500" },
          { icon: FaUserAstronaut, value: stats.astrologersCount, label: "Astrologers", color: "from-purple-500 to-pink-500" },
          { icon: FaShoppingBag, value: stats.productsCount, label: "Products", color: "from-green-500 to-emerald-500" },
          { icon: FaRupeeSign, value: `₹${stats.totalRevenue}`, label: "Revenue", color: "from-amber-500 to-orange-500" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="p-5 bg-white rounded-2xl border shadow-sm hover:shadow-md transition"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center`}
              >
                <stat.icon className="text-white text-xl" />
              </div>
            </div>

            <p className="text-2xl font-bold text-[#003D33]">{stat.value}</p>
            <p className="text-[#00695C] text-sm sm:text-base">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          { icon: FaBox, value: stats.totalOrders, label: "Total Orders", color: "from-indigo-500 to-purple-500" },
          { icon: FaClock, value: stats.pendingOrders, label: "Pending Orders", color: "from-amber-500 to-orange-500" },
          { icon: FaComments, value: stats.activeChats, label: "Active Chats", color: "from-teal-500 to-green-500" },
        ].map((stat) => (
          <div className="p-5 bg-white border rounded-2xl shadow-sm flex gap-3 items-center">
            <div
              className={`w-14 h-14 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center`}
            >
              <stat.icon className="text-white text-2xl" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-[#003D33]">
                {stat.value}
              </h3>
              <p className="text-[#00695C] text-sm sm:text-base">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts + Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Revenue Chart */}
        <div className="bg-white border rounded-2xl p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-[#003D33] mb-3">
            Revenue Overview
          </h3>
          <div className="h-52 sm:h-64 rounded-xl bg-gradient-to-br 
            from-[#F7F3E9] to-[#ECE5D3] flex items-center justify-center">
            <ChartLoader />
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white border rounded-2xl p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-[#003D33] mb-3">
            Recent Orders
          </h3>

          <div className="space-y-3">
            {orders.slice(0, 5).map((o) => (
              <div
                key={o._id}
                className="p-3 bg-[#F7F3E9] rounded-xl flex justify-between items-center hover:bg-[#ECE5D3]"
              >
                <div>
                  <p className="font-semibold text-[#003D33]">
                    Order #{o._id}
                  </p>
                  <p className="text-[#00695C] text-sm">{o.user.name}</p>
                </div>

                <div className="text-right">
                  <p className="font-bold text-[#C06014]">
                    ₹{o.totalAmount}
                  </p>
                  <span
                    className={`text-xs px-2 py-1 rounded-md ${statusColor[o.orderStatus] || "bg-gray-200"}`}
                  >
                    {o.orderStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

    </div>
  );
};

export default Dashboard;
