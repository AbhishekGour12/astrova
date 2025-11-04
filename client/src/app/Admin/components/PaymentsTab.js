import { motion } from 'framer-motion';
import { FaEye, FaCreditCard } from 'react-icons/fa';

const PaymentsTab = ({ payments, searchTerm }) => {
  const filteredPayments = payments.filter(payment =>
    payment.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    const colors = {
      completed: 'bg-green-100 text-green-600',
      pending: 'bg-amber-100 text-amber-600',
      failed: 'bg-red-100 text-red-600'
    };
    return colors[status] || 'bg-gray-100 text-gray-600';
  };

  return (
    <div>
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
    </div>
  );
};

export default PaymentsTab;