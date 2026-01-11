"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import apiAstrologer from "../lib/apiAstrologer";
import {
  FaComments,
  FaPhone,
  FaWallet,
  FaHome,
  FaUser,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaChartLine,
  FaHistory,
  FaCog
} from "react-icons/fa";

// Import components
import ChatDashboard from "./components/ChatDashboard";
import CallDashboard from "./components/CallDashboard";
import PayoutsDashboard from "./components/PayoutsDashboard";

export default function AstrologerDashboard() {
  const router = useRouter();
  const [astrologer, setAstrologer] = useState(null);
  const [activeTab, setActiveTab] = useState("chat"); // "chat", "call", "payouts"
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    todayEarnings: 0,
    activeChats: 0,
    waitingCalls: 0,
    pendingPayouts: 0
  });

  // Load astrologer data
  useEffect(() => {
    const checkAuthAndLoad = async () => {
      const astrologerId = localStorage.getItem("astrologer_id");
      if (!astrologerId) {
        router.push("/astrologer/login");
        return;
      }

      try {
        const [profileRes, statsRes] = await Promise.all([
          apiAstrologer.get(`/astrologer/profile/${astrologerId}`),
          apiAstrologer.get(`/astrologer/stats/${astrologerId}`)
        ]);

        if (profileRes.data.success) {
          setAstrologer(profileRes.data.astrologer);
        }

        if (statsRes.data.success) {
          setStats(statsRes.data.stats);
        }
      } catch (error) {
        console.error("Load data error:", error);
        toast.error("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndLoad();
  }, [router]);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("astrologer_id");
    localStorage.removeItem("astrologer_token");
    toast.success("Logged out successfully");
    router.push("/Astrologer/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#C06014] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm border-b sticky top-0 z-30">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="font-semibold text-gray-800 text-sm">
                {astrologer?.fullName}
              </p>
              <p className="text-xs text-gray-500">
                {astrologer?.specialization || "Astrologer"}
              </p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-r from-[#C06014] to-[#D47C3A] rounded-full flex items-center justify-center text-white font-bold">
              {astrologer?.fullName?.charAt(0) || "A"}
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className={`
          fixed lg:static inset-y-0 left-0 z-20
          transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 transition-transform duration-300
          w-64 bg-white border-r border-gray-200
          flex flex-col h-screen
        `}>
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-[#C06014] to-[#D47C3A] rounded-full flex items-center justify-center text-white font-bold text-lg">
                {astrologer?.fullName?.charAt(0) || "A"}
              </div>
              <div>
                <h2 className="font-bold text-gray-800">{astrologer?.fullName}</h2>
                <p className="text-sm text-gray-500">{astrologer?.experience || "0"} years exp</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                astrologer?.isAvailable 
                  ? "bg-green-100 text-green-700" 
                  : "bg-red-100 text-red-700"
              }`}>
                {astrologer?.isAvailable ? "🟢 Online" : "🔴 Offline"}
              </span>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 p-4 space-y-2">
            <NavItem
              icon={<FaHome />}
              label="Overview"
              active={activeTab === "overview"}
              onClick={() => setActiveTab("overview")}
            />
            <NavItem
              icon={<FaComments />}
              label="Chat"
              active={activeTab === "chat"}
              onClick={() => setActiveTab("chat")}
              badge={stats.activeChats}
            />
            <NavItem
              icon={<FaPhone />}
              label="Calls"
              active={activeTab === "call"}
              onClick={() => setActiveTab("call")}
              badge={stats.waitingCalls}
            />
            <NavItem
              icon={<FaWallet />}
              label="Payouts"
              active={activeTab === "payouts"}
              onClick={() => setActiveTab("payouts")}
              badge={stats.pendingPayouts}
            />
            <NavItem
              icon={<FaChartLine />}
              label="Analytics"
              active={activeTab === "analytics"}
              onClick={() => setActiveTab("analytics")}
            />
            <NavItem
              icon={<FaHistory />}
              label="History"
              active={activeTab === "history"}
              onClick={() => setActiveTab("history")}
            />
            <NavItem
              icon={<FaUser />}
              label="Profile"
              active={activeTab === "profile"}
              onClick={() => setActiveTab("profile")}
            />
            <NavItem
              icon={<FaCog />}
              label="Settings"
              active={activeTab === "settings"}
              onClick={() => setActiveTab("settings")}
            />
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <FaSignOutAlt />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {/* Top Bar */}
          <div className="hidden lg:flex items-center justify-between bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-800 capitalize">
                {activeTab === "chat" && "Chat Dashboard"}
                {activeTab === "call" && "Call Dashboard"}
                {activeTab === "payouts" && "Payouts"}
                {activeTab === "overview" && "Overview"}
                {activeTab === "analytics" && "Analytics"}
                {activeTab === "history" && "History"}
                {activeTab === "profile" && "Profile"}
                {activeTab === "settings" && "Settings"}
              </h1>
              {activeTab === "chat" && stats.activeChats > 0 && (
                <span className="bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full">
                  {stats.activeChats} active
                </span>
              )}
              {activeTab === "call" && stats.waitingCalls > 0 && (
                <span className="bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded-full">
                  {stats.waitingCalls} waiting
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-6">
              {/* Quick Stats */}
              <div className="hidden md:flex items-center gap-6">
                <div className="text-center">
                  <div className="text-lg font-bold text-[#C06014]">
                    ₹{stats.todayEarnings}
                  </div>
                  <div className="text-xs text-gray-500">Today</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-800">
                    ₹{stats.totalEarnings}
                  </div>
                  <div className="text-xs text-gray-500">Total</div>
                </div>
              </div>
              
              {/* Availability Toggle */}
              <button
                onClick={() => {
                  // Toggle availability
                  toast.success(astrologer?.isAvailable ? "Going offline" : "Going online");
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  astrologer?.isAvailable
                    ? "bg-red-100 text-red-600 hover:bg-red-200"
                    : "bg-green-100 text-green-600 hover:bg-green-200"
                }`}
              >
                {astrologer?.isAvailable ? "Go Offline" : "Go Online"}
              </button>
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="p-4 lg:p-6">
            {activeTab === "overview" && <OverviewTab astrologer={astrologer} stats={stats} />}
            {activeTab === "chat" && <ChatDashboard />}
            {activeTab === "call" && <CallDashboard />}
            {activeTab === "payouts" && <PayoutsDashboard />}
            {activeTab === "analytics" && <AnalyticsTab />}
            {activeTab === "history" && <HistoryTab />}
            {activeTab === "profile" && <ProfileTab astrologer={astrologer} />}
            {activeTab === "settings" && <SettingsTab />}
          </div>
        </div>
      </div>
    </div>
  );
}

// Navigation Item Component
function NavItem({ icon, label, active, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-between w-full p-3 rounded-lg transition-all ${
        active 
          ? 'bg-gradient-to-r from-[#C06014]/10 to-[#D47C3A]/10 text-[#C06014] border-l-4 border-[#C06014]' 
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-lg">{icon}</span>
        <span className="font-medium">{label}</span>
      </div>
      {badge > 0 && (
        <span className={`text-xs px-2 py-1 rounded-full ${
          active ? 'bg-[#C06014] text-white' : 'bg-gray-200 text-gray-700'
        }`}>
          {badge}
        </span>
      )}
    </button>
  );
}

// Overview Tab Component
function OverviewTab({ astrologer, stats }) {
  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-[#003D33] to-[#00695C] rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Welcome back, {astrologer?.fullName}!</h2>
            <p className="text-white/80">Here's what's happening with your account today.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold">4.8</div>
              <div className="text-sm text-white/70">Rating</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{astrologer?.totalChats || 0}</div>
              <div className="text-sm text-white/70">Total Chats</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Earnings"
          value={`₹${stats.todayEarnings}`}
          icon="💰"
          color="green"
          trend="+12%"
        />
        <StatCard
          title="Active Chats"
          value={stats.activeChats}
          icon="💬"
          color="blue"
          trend="+3"
        />
        <StatCard
          title="Waiting Calls"
          value={stats.waitingCalls}
          icon="📞"
          color="purple"
          trend="+2"
        />
        <StatCard
          title="Pending Payout"
          value={`₹${stats.pendingPayouts}`}
          icon="💳"
          color="orange"
          trend="Process"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="font-bold text-gray-800 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
              <span className="font-medium text-gray-700">Start New Session</span>
              <span className="text-[#C06014]">→</span>
            </button>
            <button className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
              <span className="font-medium text-gray-700">Withdraw Earnings</span>
              <span className="text-[#C06014]">→</span>
            </button>
            <button className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
              <span className="font-medium text-gray-700">Update Schedule</span>
              <span className="text-[#C06014]">→</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="font-bold text-gray-800 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <ActivityItem time="2 min ago" text="Accepted chat request from User123" />
            <ActivityItem time="15 min ago" text="Completed call with Priya S." />
            <ActivityItem time="1 hour ago" text="Received payment of ₹500" />
            <ActivityItem time="2 hours ago" text="New review received (5 stars)" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, trend }) {
  const colors = {
    green: 'from-green-500 to-emerald-500',
    blue: 'from-blue-500 to-cyan-500',
    purple: 'from-purple-500 to-violet-500',
    orange: 'from-orange-500 to-amber-500'
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${colors[color]} flex items-center justify-center text-white text-xl`}>
          {icon}
        </div>
        <span className="text-sm font-medium text-green-600">{trend}</span>
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-800">{value}</div>
        <div className="text-sm text-gray-500">{title}</div>
      </div>
    </div>
  );
}

function ActivityItem({ time, text }) {
  return (
    <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="w-2 h-2 bg-[#C06014] rounded-full mt-2"></div>
      <div className="flex-1">
        <p className="text-gray-700">{text}</p>
        <p className="text-xs text-gray-400 mt-1">{time}</p>
      </div>
    </div>
  );
}

// Placeholder components for other tabs
function AnalyticsTab() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Analytics Dashboard</h2>
      <p className="text-gray-500">Analytics features coming soon...</p>
    </div>
  );
}

function HistoryTab() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h2 className="text-xl font-bold text-gray-800 mb-6">History</h2>
      <p className="text-gray-500">History features coming soon...</p>
    </div>
  );
}

function ProfileTab({ astrologer }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Profile Settings</h2>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-gradient-to-r from-[#C06014] to-[#D47C3A] rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {astrologer?.fullName?.charAt(0) || "A"}
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-lg">{astrologer?.fullName}</h3>
            <p className="text-gray-500">{astrologer?.email}</p>
            <p className="text-gray-500">{astrologer?.phone}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsTab() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Settings</h2>
      <p className="text-gray-500">Settings features coming soon...</p>
    </div>
  );
}