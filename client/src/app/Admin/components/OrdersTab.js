import { motion } from 'framer-motion';
import { FaEye, FaTruck } from 'react-icons/fa';

const OrdersTab = ({ orders, searchTerm, onUpdateOrderStatus }) => {
  const filteredOrders = orders.filter(order =>
    order.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.orderStatus.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-amber-100 text-amber-600',
      confirmed: 'bg-blue-100 text-blue-600',
      shipped: 'bg-indigo-100 text-indigo-600',
      delivered: 'bg-green-100 text-green-600',
      cancelled: 'bg-red-100 text-red-600'
    };
    return colors[status] || 'bg-gray-100 text-gray-600';
  };

  return (
    <div>
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
                      onChange={(e) => onUpdateOrderStatus(order._id, e.target.value)}
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
    </div>
  );
};

export default OrdersTab;