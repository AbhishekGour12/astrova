// components/AstrologerPayoutsTab.js
"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FaSearch,
  FaFilter,
  FaDownload,
  FaRupeeSign,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaCreditCard,
  FaCalendar,
  FaMoneyBillWave,
  FaFileInvoiceDollar,
  FaEye,
  FaBarcode
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import api from '../../lib/api';

const AstrologerPayoutsTab = () => {
  const [loading, setLoading] = useState(true);
  const [astrologers, setAstrologers] = useState([]);
  const [filteredAstrologers, setFilteredAstrologers] = useState([]);
  const [weeklySummary, setWeeklySummary] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAstrologers, setSelectedAstrologers] = useState([]);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [selectedEarnings, setSelectedEarnings] = useState([]);
  const [payoutDetails, setPayoutDetails] = useState({
    paymentMode: 'IMPS',
    transactionId: '',
    notes: ''
  });

  // Weeks for selection
  const weeks = [
    { label: 'This Week', start: getWeekStart(0), end: new Date() },
    { label: 'Last Week', start: getWeekStart(-7), end: getWeekStart(0) },
    { label: '2 Weeks Ago', start: getWeekStart(-14), end: getWeekStart(-7) },
    { label: 'Custom', start: '', end: '' }
  ];

  function getWeekStart(daysOffset) {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  // Fetch astrologers with unpaid earnings
  const fetchAstrologers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedWeek) {
        const week = weeks.find(w => w.label === selectedWeek);
        if (week && week.start) {
          params.weekStart = week.start.toISOString();
          params.weekEnd = week.end.toISOString();
        }
      }
      
      const response = await api.get('/admin-payout/astrologerpayouts/astrologers/unpaid', { params });
      
      if (response.data.success) {
        setAstrologers(response.data.data.astrologers);
        setFilteredAstrologers(response.data.data.astrologers);
        setWeeklySummary(response.data.data.weeklySummary);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load astrologers data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAstrologers();
  }, [selectedWeek]);

  // Filter astrologers based on search
  useEffect(() => {
    if (!searchTerm) {
      setFilteredAstrologers(astrologers);
      return;
    }

    const filtered = astrologers.filter(astrologer =>
      astrologer.astrologerDetails.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      astrologer.astrologerDetails.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      astrologer.astrologerDetails.phone.includes(searchTerm)
    );
    setFilteredAstrologers(filtered);
  }, [searchTerm, astrologers]);

  // Handle astrologer selection for bulk payout
  const handleAstrologerSelect = (astrologerId) => {
    setSelectedAstrologers(prev =>
      prev.includes(astrologerId)
        ? prev.filter(id => id !== astrologerId)
        : [...prev, astrologerId]
    );
  };

  // Handle payout for single astrologer
  const handlePayout = (astrologer) => {
    setSelectedEarnings(astrologer.earnings);
    setPayoutDetails({
      ...payoutDetails,
      astrologerId: astrologer.astrologerId,
      amount: astrologer.totalAmount
    });
    setShowPayoutModal(true);
  };

  // Process payout
  const processPayout = async () => {
    try {
      if (!payoutDetails.transactionId) {
        toast.error('Please enter transaction ID');
        return;
      }

      const payload = {
        astrologerId: payoutDetails.astrologerId,
        amount: payoutDetails.amount,
        earnings: selectedEarnings.map(e => e._id),
        paymentMode: payoutDetails.paymentMode,
        transactionId: payoutDetails.transactionId,
        notes: payoutDetails.notes
      };

      const response = await api.post('/admin-payout/astrologerpayouts/process/manual', payload);
      
      if (response.data.success) {
        toast.success('Payout processed successfully');
        setShowPayoutModal(false);
        setPayoutDetails({
          paymentMode: 'IMPS',
          transactionId: '',
          notes: ''
        });
        fetchAstrologers(); // Refresh data
      }
    } catch (error) {
      console.error('Payout error:', error);
      toast.error(error.response?.data?.message || 'Failed to process payout');
    }
  };

  // Process bulk payout
  const processBulkPayout = async () => {
    if (selectedAstrologers.length === 0) {
      toast.error('Please select astrologers for bulk payout');
      return;
    }

    const paymentMode = prompt('Enter payment mode (IMPS/NEFT/RTGS/UPI):', 'IMPS');
    const transactionId = prompt('Enter transaction ID:');
    
    if (!transactionId) {
      toast.error('Transaction ID is required');
      return;
    }

    try {
      const payload = {
        astrologerIds: selectedAstrologers,
        weekStart: weeks.find(w => w.label === selectedWeek)?.start?.toISOString() || new Date().toISOString(),
        weekEnd: weeks.find(w => w.label === selectedWeek)?.end?.toISOString() || new Date().toISOString(),
        paymentMode,
        transactionId,
        notes: 'Bulk payment processed'
      };

      const response = await api.post('/admin-payout/astrologerpayouts/bulk/process', payload);
      
      if (response.data.success) {
        toast.success(`Processed ${response.data.results.length} payouts`);
        setSelectedAstrologers([]);
        fetchAstrologers(); // Refresh data
      }
    } catch (error) {
      console.error('Bulk payout error:', error);
      toast.error(error.response?.data?.message || 'Failed to process bulk payout');
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const csvData = filteredAstrologers.map(astrologer => ({
      'Astrologer Name': astrologer.astrologerDetails.fullName,
      'Email': astrologer.astrologerDetails.email,
      'Phone': astrologer.astrologerDetails.phone,
      'Bank Name': astrologer.astrologerDetails.bankName,
      'Account Number': astrologer.astrologerDetails.bankAccountNumber,
      'IFSC': astrologer.astrologerDetails.ifsc,
      'Total Amount': astrologer.totalAmount,
      'Total Sessions': astrologer.totalSessions,
      'Chat Sessions': astrologer.chatSessions,
      'Call Sessions': astrologer.callSessions,
      'Chat Earnings': astrologer.chatEarnings,
      'Call Earnings': astrologer.callEarnings
    }));

    const headers = Object.keys(csvData[0]);
    const csvRows = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => row[header]).join(','))
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `astrologer_payouts_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C06014]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Summary */}
      <div className="bg-gradient-to-r from-[#003D33] to-[#00695C] rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-2">Astrologer Payouts</h1>
            <p className="text-white/80">Manage and process astrologer earnings</p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-4">
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg"
            >
              <FaDownload /> Export CSV
            </button>
            <button
              onClick={processBulkPayout}
              disabled={selectedAstrologers.length === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                selectedAstrologers.length === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              <FaMoneyBillWave /> Bulk Pay ({selectedAstrologers.length})
            </button>
          </div>
        </div>
      </div>

      {/* Weekly Summary */}
      {weeklySummary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Unpaid</p>
                <p className="text-2xl font-bold text-gray-800">₹{weeklySummary.totalAmount}</p>
              </div>
              <FaRupeeSign className="text-green-500 text-2xl" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Astrologers</p>
                <p className="text-2xl font-bold text-gray-800">{weeklySummary.totalAstrologers}</p>
              </div>
              <FaUser className="text-blue-500 text-2xl" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Chat Sessions</p>
                <p className="text-2xl font-bold text-gray-800">{weeklySummary.chatSessions}</p>
              </div>
              <FaClock className="text-purple-500 text-2xl" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Call Sessions</p>
                <p className="text-2xl font-bold text-gray-800">{weeklySummary.callSessions}</p>
              </div>
              <FaPhone className="text-orange-500 text-2xl" />
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-xl shadow">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search astrologers by name, email or phone..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C06014]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-4">
            <select
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C06014]"
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
            >
              <option value="">All Time</option>
              {weeks.map(week => (
                <option key={week.label} value={week.label}>{week.label}</option>
              ))}
            </select>
            <button
              onClick={() => setSelectedWeek('')}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <FaFilter /> Clear
            </button>
          </div>
        </div>
      </div>

      {/* Astrologers Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="py-3 px-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedAstrologers.length === filteredAstrologers.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedAstrologers(filteredAstrologers.map(a => a.astrologerId));
                      } else {
                        setSelectedAstrologers([]);
                      }
                    }}
                  />
                </th>
                <th className="py-3 px-4 text-left font-medium text-gray-700">Astrologer</th>
                <th className="py-3 px-4 text-left font-medium text-gray-700">Contact</th>
                <th className="py-3 px-4 text-left font-medium text-gray-700">Bank Details</th>
                <th className="py-3 px-4 text-left font-medium text-gray-700">Earnings</th>
                <th className="py-3 px-4 text-left font-medium text-gray-700">Sessions</th>
                <th className="py-3 px-4 text-left font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAstrologers.map((astrologer, index) => (
                <motion.tr
                  key={astrologer.astrologerId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedAstrologers.includes(astrologer.astrologerId)}
                      onChange={() => handleAstrologerSelect(astrologer.astrologerId)}
                    />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-[#C06014] to-[#D47C3A] rounded-full flex items-center justify-center text-white font-bold">
                        {astrologer.astrologerDetails.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{astrologer.astrologerDetails.fullName}</p>
                        <p className="text-sm text-gray-500">{astrologer.astrologerDetails.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      <p className="flex items-center gap-2">
                        <FaPhone className="text-gray-400 text-sm" />
                        {astrologer.astrologerDetails.phone}
                      </p>
                      <p className="flex items-center gap-2 text-sm">
                        <FaEnvelope className="text-gray-400" />
                        {astrologer.astrologerDetails.email}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      <p className="font-medium">{astrologer.astrologerDetails.bankName}</p>
                      <p className="text-sm text-gray-600">
                        {astrologer.astrologerDetails.bankAccountNumber}
                      </p>
                      <p className="text-sm text-gray-500">IFSC: {astrologer.astrologerDetails.ifsc}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      <p className="text-xl font-bold text-green-600">
                        ₹{astrologer.totalAmount}
                      </p>
                      <div className="flex gap-2 text-xs">
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          Chat: ₹{astrologer.chatEarnings}
                        </span>
                        <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">
                          Call: ₹{astrologer.callEarnings}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      <p className="font-medium">{astrologer.totalSessions} total</p>
                      <div className="flex gap-2 text-xs">
                        <span>{astrologer.chatSessions} chats</span>
                        <span>{astrologer.callSessions} calls</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePayout(astrologer)}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
                      >
                        <FaMoneyBillWave /> Pay ₹{astrologer.totalAmount}
                      </button>
                    
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAstrologers.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No unpaid earnings found</p>
          </div>
        )}
      </div>

      {/* Payout Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full"
          >
            <h2 className="text-xl font-bold mb-4">Process Payout</h2>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Amount to Pay</p>
                <p className="text-2xl font-bold text-green-600">₹{payoutDetails.amount}</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Payment Mode</label>
                <select
                  className="w-full p-2 border rounded-lg"
                  value={payoutDetails.paymentMode}
                  onChange={(e) => setPayoutDetails({...payoutDetails, paymentMode: e.target.value})}
                >
                  <option value="IMPS">IMPS</option>
                  <option value="NEFT">NEFT</option>
                  <option value="RTGS">RTGS</option>
                  <option value="UPI">UPI</option>
                  <option value="MANUAL">Manual</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Transaction ID *</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-lg"
                  placeholder="Enter transaction ID"
                  value={payoutDetails.transactionId}
                  onChange={(e) => setPayoutDetails({...payoutDetails, transactionId: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Notes</label>
                <textarea
                  className="w-full p-2 border rounded-lg"
                  rows="3"
                  placeholder="Add any notes..."
                  value={payoutDetails.notes}
                  onChange={(e) => setPayoutDetails({...payoutDetails, notes: e.target.value})}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowPayoutModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={processPayout}
                disabled={!payoutDetails.transactionId}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  !payoutDetails.transactionId
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                <FaCheckCircle /> Confirm Payout
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AstrologerPayoutsTab;