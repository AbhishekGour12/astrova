import { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import api from "../../lib/api";

const PaymentsTab = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Fetch payments
  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/payment");
      setPayments(response.data.data);
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Export to Excel function
  const exportToExcel = () => {
    try {
      setExporting(true);
      
      // Prepare data
      const excelData = payments.map(payment => ({
        "Order ID": payment.orderId?._id || "N/A",
        "Order Number": payment.orderId?.orderNumber || "N/A",
        "Customer": payment.orderId?.customerName || "N/A",
        "Payment ID": payment.paymentId || "N/A",
        "Amount": payment.amount,
        "Method": payment.method,
        "Status": payment.status,
        "Date": new Date(payment.createdAt).toLocaleString()
      }));

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Payments");

      // Generate file
      XLSX.writeFile(workbook, `payments_${Date.now()}.xlsx`);
      
      setExporting(false);
    } catch (error) {
      console.error("Export error:", error);
      setExporting(false);
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'failed': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading payments...</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Payments</h1>
          <p className="text-gray-600">Total: {payments.length} payments</p>
        </div>
        
        <button
          onClick={exportToExcel}
          disabled={exporting || payments.length === 0}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {exporting ? "Exporting..." : "Export to Excel"}
        </button>
      </div>

      {/* Payments Table */}
      {payments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No payments found
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {payments.map((payment) => (
                <tr key={payment._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {payment.razorpayOrderId || "N/A"}
                    </div>
                    
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">
                      ₹{payment.amount}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payment.method}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(payment.status)}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PaymentsTab;