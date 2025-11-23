import { motion } from "framer-motion";
import { FaEye, FaCreditCard } from "react-icons/fa";

const PaymentsTab = ({ payments, searchTerm }) => {
  const filteredPayments = payments.filter((payment) =>
    payment.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    const colors = {
      completed: "bg-green-100 text-green-700",
      pending: "bg-amber-100 text-amber-700",
      failed: "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-gray-100 text-gray-600";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#003D33]">
            Payment Management
          </h2>
          <p className="text-[#00695C] text-sm sm:text-base">
            Monitor and manage payment transactions
          </p>
        </div>

        <span className="text-[#00695C] bg-[#ECE5D3] px-4 py-1 rounded-full text-sm sm:text-base">
          {filteredPayments.length} payments
        </span>
      </div>

      {/* Desktop Table */}
      <div className="hidden sm:block bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[750px]">
            <thead className="bg-[#F7F3E9] sticky top-0 z-10">
              <tr className="text-[#003D33]">
                <th className="px-4 py-3 text-left">Order ID</th>
                <th className="px-4 py-3 text-left">Amount</th>
                <th className="px-4 py-3 text-left">Method</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredPayments.map((payment) => (
                <motion.tr
                  key={payment._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-t hover:bg-[#FAF7F0]"
                >
                  <td className="px-4 py-3 font-semibold text-[#003D33]">
                    {payment.orderId}
                  </td>

                  <td className="px-4 py-3 text-[#C06014] font-bold">
                    ₹{payment.amount}
                  </td>

                  <td className="px-4 py-3 text-[#00695C] capitalize">
                    {payment.method.replace("_", " ")}
                  </td>

                  <td className="px-4 py-3 text-[#00695C]">
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-lg text-xs font-semibold ${getStatusColor(
                        payment.status
                      )}`}
                    >
                      {payment.status}
                    </span>
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

      {/* Mobile Card View */}
      <div className="grid sm:hidden gap-4">
        {filteredPayments.map((payment) => (
          <motion.div
            key={payment._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-4 rounded-2xl shadow border"
          >
            <div className="flex justify-between">
              <h3 className="font-semibold text-[#003D33] text-sm">
                {payment.orderId}
              </h3>
              <span className="text-xs font-bold text-[#C06014]">
                ₹{payment.amount}
              </span>
            </div>

            <div className="text-xs text-[#00695C] mt-1 capitalize">
              {payment.method.replace("_", " ")}
            </div>

            <div className="flex justify-between text-xs text-[#00695C] mt-2">
              <span>{new Date(payment.createdAt).toLocaleDateString()}</span>
              <span
                className={`px-2 py-1 rounded-lg font-semibold ${getStatusColor(
                  payment.status
                )} text-xs`}
              >
                {payment.status}
              </span>
            </div>

            <div className="flex justify-end mt-3">
              <ActionGroup small />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

/* Reusable Action Buttons */
const ActionGroup = ({ small }) => (
  <div className={`flex gap-2 ${small ? "text-xs" : "text-base"}`}>
    <ActionIcon icon={<FaEye />} />
    <ActionIcon icon={<FaCreditCard />} />
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

export default PaymentsTab;
