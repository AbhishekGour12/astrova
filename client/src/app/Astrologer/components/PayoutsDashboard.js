"use client";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  FaWallet,
  FaHistory,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaPhone,
  FaComments,
  FaCalendarWeek,
  FaInfoCircle
} from "react-icons/fa";
import api from "../../lib/api";

export default function PayoutsDashboard() {
  // ✅ FIX 1: Initialize as empty array
  const [payouts, setPayouts] = useState([]); 
  const [unpaidBalance, setUnpaidBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSessions: 0,
    chat: { earnings: 0, minutes: 0, sessions: 0 },
    call: { earnings: 0, minutes: 0, sessions: 0 }
  });

  useEffect(() => {
    loadPayouts();
  }, []);

  const loadPayouts = async () => {
    try {
      // ✅ FIX 2: Ensure ID exists
      const astrologerId = localStorage.getItem("astrologer_id") || localStorage.getItem("userId"); 
      if(!astrologerId) return;

      const response = await api.get(`/payouts/${astrologerId}`);
      
      if (response.data.success) {
        // ✅ FIX 3: Map backend response correctly
        setPayouts(response.data.payouts || []); 
        setUnpaidBalance(response.data.unpaidBalance || 0);
        setStats(response.data.weeklyStats || response.data.stats || {
          totalSessions: 0,
          chat: { earnings: 0, minutes: 0, sessions: 0 },
          call: { earnings: 0, minutes: 0, sessions: 0 }
        });
      }
    } catch (error) {
      console.error("Load payouts error:", error);
      // Don't show toast on 404 (just means no history yet)
    } finally {
      setLoading(false);
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
    // Razorpay statuses
    const s = status?.toLowerCase();
    if (s === "processed" || s === "completed") return <FaCheckCircle className="text-green-500" />;
    if (s === "failed" || s === "reversed") return <FaTimesCircle className="text-red-500" />;
    return <FaClock className="text-yellow-500" />; // processing, queued, pending
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-10 h-10 border-4 border-[#C06014] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* 1. Next Payout Card (Ready for next week) */}
      <div className="bg-gradient-to-r from-[#003D33] to-[#00695C] rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2 text-white/80">
              <FaCalendarWeek />
              <h2 className="text-sm uppercase tracking-wider font-semibold">Next Payout Amount</h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-4xl font-bold">₹{unpaidBalance.toLocaleString()}</div>
            </div>
            <p className="text-white/70 mt-2 text-sm">
              Accumulated earnings waiting for next automated payout.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 min-w-[250px] border border-white/20">
            <div className="flex items-start gap-3">
              <FaInfoCircle className="text-yellow-400 mt-1" />
              <div>
                <h3 className="font-semibold text-sm">Automated Payouts</h3>
                <p className="text-xs text-white/80 mt-1 leading-relaxed">
                  Payouts are processed automatically every <strong>Monday</strong>. 
                  No manual action required.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Breakdown of Unpaid Earnings */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* Chat Stats */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <FaComments className="text-blue-500" />
            <span className="text-xs font-medium uppercase">Chat Earnings</span>
          </div>
          <div className="text-xl font-bold text-gray-800">₹{stats.chat.earnings}</div>
          <div className="text-xs text-gray-400 mt-1">{stats.chat.sessions} sessions</div>
        </div>

        {/* Call Stats */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <FaPhone className="text-purple-500" />
            <span className="text-xs font-medium uppercase">Call Earnings</span>
          </div>
          <div className="text-xl font-bold text-gray-800">₹{stats.call.earnings}</div>
          <div className="text-xs text-gray-400 mt-1">{stats.call.sessions} sessions</div>
        </div>

        {/* Total Stats */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <FaWallet className="text-green-500" />
            <span className="text-xs font-medium uppercase">Total Unpaid</span>
          </div>
          <div className="text-xl font-bold text-gray-800">₹{unpaidBalance}</div>
          <div className="text-xs text-gray-400 mt-1">{stats.totalSessions} total sessions</div>
        </div>
      </div>

      {/* 3. Payout History Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <FaHistory className="text-[#C06014]" />
            Payout History
          </h3>
          <button onClick={loadPayouts} className="text-xs text-gray-500 hover:text-[#C06014]">
            Refresh Status
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
              <tr>
                <th className="px-6 py-4 text-left">Date Processed</th>
                <th className="px-6 py-4 text-left">Amount</th>
                <th className="px-6 py-4 text-left">Method</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-left">Reference ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {/* ✅ FIX 4: Safe check for length */}
              {payouts && payouts.length > 0 ? (
                payouts.map((payout) => (
                  <tr key={payout._id || payout.payoutId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-600">
                      {formatDate(payout.createdAt)}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-800">
                      ₹{payout.amount?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                        {payout.mode || "BANK"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                        payout.status?.toLowerCase() === "processed" 
                          ? "bg-green-50 text-green-700 border-green-200"
                          : payout.status?.toLowerCase() === "failed"
                          ? "bg-red-50 text-red-700 border-red-200"
                          : "bg-yellow-50 text-yellow-700 border-yellow-200"
                      }`}>
                        {getStatusIcon(payout.status)}
                        <span className="uppercase">{payout.status || "PENDING"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                      {payout.utr || payout.payoutId?.slice(0,14) + "..."}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center">
                      <FaHistory className="text-2xl mb-2 opacity-20" />
                      <p>No payout history found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}