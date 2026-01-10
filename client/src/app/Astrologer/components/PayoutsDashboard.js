"use client";
import { useState, useEffect } from "react";
import apiAstrologer from "../../lib/apiAstrologer";
import toast from "react-hot-toast";
import {
  FaWallet,
  FaRupeeSign,
  FaCreditCard,
  FaHistory,
  FaDownload,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaPhone,
  FaComments,
  FaCalendarWeek
} from "react-icons/fa";
import api from "../../lib/api";

export default function PayoutsDashboard() {
  const [payouts, setPayouts] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [weeklyStats, setWeeklyStats] = useState({
    totalEarnings: 0,
    totalSessions: 0,
    chat: { earnings: 0, minutes: 0, sessions: 0 },
    call: { earnings: 0, minutes: 0, sessions: 0 }
  });

  useEffect(() => {
    loadPayouts();
  }, []);

  const loadPayouts = async () => {
    try {
      const astrologerId = localStorage.getItem("astrologer_id");
      const response = await api.get(`/payouts/${astrologerId}`);
      console.log(response.data)
      if (response.data.success) {
        setPayouts(response.data.payouts);
        setBalance(response.data.balance);
        setWeeklyStats(response.data.weeklyStats || {
          totalEarnings: 0,
          totalSessions: 0,
          chat: { earnings: 0, minutes: 0, sessions: 0 },
          call: { earnings: 0, minutes: 0, sessions: 0 }
        });
      }
    } catch (error) {
      console.error("Load payouts error:", error);
      toast.error("Failed to load payout data");
    } finally {
      setLoading(false);
    }
  };

  const handleWeeklyPayout = async () => {
    try {
      const astrologerId = localStorage.getItem("astrologer_id");
      const response = await api.post(`/payouts/${astrologerId}/initiate`);
      
      if (response.data.success) {
        toast.success("Weekly payout initiated successfully!");
        loadPayouts();
      }
    } catch (error) {
      console.error("Weekly payout error:", error);
      toast.error(error.response?.data?.message || "Failed to initiate payout");
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case "PROCESSED":
      case "COMPLETED":
        return <FaCheckCircle className="text-green-500" />;
      case "PROCESSING":
      case "QUEUED":
        return <FaClock className="text-yellow-500" />;
      case "FAILED":
      case "REVERSED":
        return <FaTimesCircle className="text-red-500" />;
      default:
        return <FaClock className="text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#C06014] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payouts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Weekly Earnings Summary */}
      <div className="bg-gradient-to-r from-[#003D33] to-[#00695C] rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FaCalendarWeek />
              <h2 className="text-xl font-bold">This Week's Earnings</h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-4xl font-bold">₹{weeklyStats.totalEarnings.toLocaleString()}</div>
              <div className="text-sm text-white/70">
                {weeklyStats.totalSessions} sessions
              </div>
            </div>
            <p className="text-white/70 mt-2">
              Available for weekly payout
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <h3 className="font-semibold mb-2">Weekly Payout</h3>
            <p className="text-sm text-white/80 mb-3">
              Payout will be processed every week automatically
            </p>
            <button
              onClick={handleWeeklyPayout}
              disabled={weeklyStats.totalEarnings === 0}
              className={`px-6 py-3 rounded-lg font-semibold w-full ${
                weeklyStats.totalEarnings > 0 
                  ? "bg-white text-[#003D33] hover:bg-gray-100" 
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {weeklyStats.totalEarnings > 0 ? `Withdraw ₹${weeklyStats.totalEarnings}` : "No Earnings"}
            </button>
          </div>
        </div>
      </div>

      {/* Weekly Breakdown */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Total Earnings Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <FaWallet className="text-green-600 text-xl" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">
                ₹{weeklyStats.totalEarnings.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Weekly Earnings</div>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            {weeklyStats.totalSessions} total sessions
          </div>
        </div>

        {/* Chat Earnings */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FaComments className="text-blue-600 text-xl" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">
                ₹{weeklyStats.chat.earnings.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Chat Earnings</div>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            {weeklyStats.chat.sessions} sessions • {weeklyStats.chat.minutes} mins
          </div>
        </div>

        {/* Call Earnings */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <FaPhone className="text-purple-600 text-xl" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">
                ₹{weeklyStats.call.earnings.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Call Earnings</div>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            {weeklyStats.call.sessions} sessions • {weeklyStats.call.minutes} mins
          </div>
        </div>
      </div>

      {/* Payout History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <FaHistory />
              Payout History
            </h3>
            <button 
              onClick={loadPayouts}
              className="text-sm text-[#C06014] font-medium hover:text-[#A84F12]"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left p-4 text-gray-600 font-medium">Date</th>
                <th className="text-left p-4 text-gray-600 font-medium">Type</th>
                <th className="text-left p-4 text-gray-600 font-medium">Amount</th>
                <th className="text-left p-4 text-gray-600 font-medium">Method</th>
                <th className="text-left p-4 text-gray-600 font-medium">Status</th>
                <th className="text-left p-4 text-gray-600 font-medium">UTR/Ref</th>
              </tr>
            </thead>
            <tbody>
              {payouts.length > 0 ? (
                payouts.map((payout, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div className="text-sm">
                        {formatDate(payout.initiatedAt || payout.createdAt)}
                      </div>
                      {payout.settledAt && (
                        <div className="text-xs text-gray-500">
                          Settled: {formatDate(payout.settledAt)}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        payout.payoutType === "WEEKLY" 
                          ? "bg-blue-100 text-blue-700" 
                          : payout.payoutType === "AUTO"
                          ? "bg-green-100 text-green-700"
                          : "bg-purple-100 text-purple-700"
                      }`}>
                        {payout.payoutType}
                      </span>
                      {payout.weekStartDate && payout.weekEndDate && (
                        <div className="text-xs text-gray-500 mt-1">
                          {formatDate(payout.weekStartDate)} - {formatDate(payout.weekEndDate)}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="font-bold">₹{payout.amount.toLocaleString()}</div>
                      {payout.fees && payout.fees > 0 && (
                        <div className="text-xs text-gray-500">
                          Fees: ₹{payout.fees}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div>{payout.method || "Bank Transfer"}</div>
                      <div className="text-xs text-gray-500">
                        {payout.mode}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        payout.status === "PROCESSED" 
                          ? "bg-green-100 text-green-700" 
                          : payout.status === "PROCESSING" || payout.status === "QUEUED"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(payout.status)}
                          {payout.status}
                        </div>
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-500 font-mono">
                        {payout.utr || payout.referenceId?.slice(0, 12) || "N/A"}
                      </div>
                      {payout.notes && (
                        <div className="text-xs text-gray-500">
                          {payout.notes.get("accountNumber") ? `****${payout.notes.get("accountNumber")}` : ""}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">
                    <FaHistory className="text-3xl mx-auto mb-2 text-gray-300" />
                    <p>No payout history yet</p>
                    <p className="text-sm">Your weekly earnings will appear here</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payout Information */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
        <h4 className="font-bold text-gray-800 mb-2">About Weekly Payouts</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Payouts are processed automatically every week</li>
          <li>• Earnings from calls and chats are combined</li>
          <li>• Bank transfer usually takes 1-3 business days</li>
          <li>• You'll receive UTR number once processed</li>
          <li>• Contact support for any payout issues</li>
        </ul>
      </div>
    </div>
  );
}