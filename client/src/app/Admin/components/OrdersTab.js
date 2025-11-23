import { motion } from "framer-motion";
import { FaEye, FaTruck } from "react-icons/fa";

const OrdersTab = ({ orders, searchTerm, onUpdateOrderStatus }) => {
  const filteredOrders = orders.filter((order) =>
    order.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.orderStatus.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-amber-100 text-amber-700",
      confirmed: "bg-blue-100 text-blue-700",
      shipped: "bg-indigo-100 text-indigo-700",
      delivered: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-gray-100 text-gray-600";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#003D33]">
            Order Management
          </h2>
          <p className="text-[#00695C] text-sm sm:text-base">
            Manage customer orders and fulfillment
          </p>
        </div>

        <span className="text-[#00695C] bg-[#ECE5D3] px-4 py-1 rounded-full text-sm sm:text-base">
          {filteredOrders.length} orders
        </span>
      </div>

      {/* 🌐 Desktop Table */}
      <div className="hidden sm:block bg-white border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[750px]">
            <thead className="bg-[#F7F3E9] sticky top-0 z-10">
              <tr className="text-[#003D33]">
                <th className="px-4 py-3 text-left">Order ID</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Items</th>
                <th className="px-4 py-3 text-left">Amount</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.map((order) => (
                <motion.tr
                  key={order._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-t hover:bg-[#FAF7F0]"
                >
                  <td className="px-4 py-3 font-semibold text-[#003D33]">
                    #{order._id}
                  </td>

                  <td className="px-4 py-3">
                    <p className="font-medium">{order.user.name}</p>
                    <p className="text-xs text-[#00695C] line-clamp-1">
                      {order.user.email}
                    </p>
                  </td>

                  <td className="px-4 py-3 text-[#00695C]">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>

                  <td className="px-4 py-3">{order.items}</td>

                  <td className="px-4 py-3 text-[#C06014] font-bold">
                    ₹{order.totalAmount}
                  </td>

                  <td className="px-4 py-3">
                    <StatusDropdown
                      order={order}
                      getStatusColor={getStatusColor}
                      onUpdateOrderStatus={onUpdateOrderStatus}
                    />
                  </td>

                  <td className="px-4 py-3">
                    <ActionGroup />
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 📱 Mobile Card Layout */}
      <div className="grid sm:hidden gap-4">
        {filteredOrders.map((order) => (
          <motion.div
            key={order._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-4 rounded-2xl shadow border"
          >
            <div className="flex justify-between">
              <h3 className="font-semibold text-[#003D33] text-sm">
                Order #{order._id}
              </h3>
              <span className="text-xs font-semibold text-[#C06014]">
                ₹{order.totalAmount}
              </span>
            </div>

            <p className="text-sm text-[#00695C] mt-1">
              {order.user.name}
            </p>

            <div className="flex justify-between mt-2 text-xs text-[#00695C]">
              <span>{order.items} items</span>
              <span>{new Date(order.createdAt).toLocaleDateString()}</span>
            </div>

            <div className="flex justify-between items-center gap-2 mt-3">
              <StatusDropdown
                order={order}
                getStatusColor={getStatusColor}
                onUpdateOrderStatus={onUpdateOrderStatus}
              />
              <ActionGroup small />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

/* 🔽 Reusable Components */
const StatusDropdown = ({ order, getStatusColor, onUpdateOrderStatus }) => (
  <select
    value={order.orderStatus}
    onChange={(e) =>
      onUpdateOrderStatus(order._id, e.target.value)
    }
    className={`px-2 py-1 rounded-lg text-xs font-semibold border-none outline-none 
      ${getStatusColor(order.orderStatus)} w-full`}
  >
    <option value="pending">Pending</option>
    <option value="confirmed">Confirmed</option>
    <option value="shipped">Shipped</option>
    <option value="delivered">Delivered</option>
    <option value="cancelled">Cancelled</option>
  </select>
);

const ActionGroup = ({ small }) => (
  <div className={`flex gap-2 ${small ? "text-xs" : "text-base"}`}>
    <ActionIcon icon={<FaEye />} />
    <ActionIcon icon={<FaTruck />} />
  </div>
);

const ActionIcon = ({ icon }) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    className="p-2 rounded-lg bg-[#ECE5D3] text-[#003D33] hover:bg-[#C06014] hover:text-white transition"
  >
    {icon}
  </motion.button>
);

export default OrdersTab;
