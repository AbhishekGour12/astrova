"use client";
import { useState, useEffect, useRef, useCallback } from "react";
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
  FaCog,
  FaPowerOff
} from "react-icons/fa";
import {FiPower} from "react-icons/fi"

// Import components
import ChatDashboard from "./components/ChatDashboard";
import CallDashboard from "./components/CallDashboard";
import PayoutsDashboard from "./components/PayoutsDashboard";
import io from "socket.io-client"
export default function AstrologerDashboard() {
  const router = useRouter();
  const [astrologer, setAstrologer] = useState(null);
  const [reviewStats, setReviewStats] = useState();
  const [activeTab, setActiveTab] = useState("chat");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [togglingAvailability, setTogglingAvailability] = useState(false);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    todayEarnings: 0,
    activeChats: 0,
    waitingCalls: 0,
    pendingPayouts: 0,
    waitingChats: 0
  });
 const socketRef = useRef(null);

 // 1. FETCH LATEST STATS (The Source of Truth)
  const fetchRealTimeStats = useCallback(async () => {
    const astrologerId = localStorage.getItem("astrologer_id");
    if (!astrologerId) return;

    try {
        const { data } = await apiAstrologer.get(`/astrologer/stats/${astrologerId}`);
        if (data.success) {
            setStats(prev => ({
                ...prev,
                ...data.stats,
                // Ensure specific counters are synced from DB, not just local +1
                activeChats: data.stats.activeChats || 0,
                waitingCalls: data.stats.waitingCalls || 0
            }));
        }
    } catch (error) {
        console.error("Stats sync error", error);
    }
  }, []);
 // 2. SOCKET SETUP
 // Update your main dashboard useEffect for socket
useEffect(() => {
  const astrologerId = localStorage.getItem("astrologer_id");
  if (!astrologerId) return;

  const socket = io(process.env.NEXT_PUBLIC_API, {
    transports: ["websocket", "polling"],
    query: { astrologerId }
  });

  socketRef.current = socket;

  socket.on("connect", () => {
    console.log("🟢 Dashboard Socket Connected");
    socket.emit("joinAstrologer", { astrologerId });
  });

  // --- REAL-TIME STATS SYNC ---
  const syncAllStats = async () => {
    await fetchRealTimeStats();
  };

  // --- CALL EVENTS ---
  socket.on("incomingCall", (data) => {
    const call = data.call || data;
    const userName = call.user?.name || call.user?.username || "User";
    
    // Play sound if not muted
    if (!isSoundMuted) {
      const audio = new Audio('/sounds/ringtone.mp3');
      audio.play().catch(e => console.log("Audio play failed", e));
    }

    // Show notification
    toast.custom((t) => (
      <div className="bg-white p-4 rounded-xl shadow-2xl border-l-4 border-blue-500 flex items-center gap-4 cursor-pointer" 
           onClick={() => { 
             toast.dismiss(t.id); 
             setActiveTab("call");
             // Force refresh calls when switching to call tab
             if (typeof window.refreshCalls === 'function') {
               window.refreshCalls();
             }
           }}>
         <div className="bg-blue-100 p-2 rounded-full">
           <FaPhone className="text-blue-600"/>
         </div>
         <div>
           <h4 className="font-bold text-gray-800">Incoming Call</h4>
           <p className="text-sm text-gray-600">{userName} is calling...</p>
         </div>
         <button className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm">
           Go to Calls
         </button>
      </div>
    ), { duration: 10000 });

    // Sync stats from database
    syncAllStats();
  });

  socket.on("callActivated", (data) => {
    syncAllStats();
  });

  socket.on("callEnded", (data) => {
  // Update stats immediately
  setStats(prev => ({
    ...prev,
    waitingCalls: Math.max(0, prev.waitingCalls - 1)
  }));
  
  // Then sync with database
  setTimeout(() => fetchRealTimeStats(), 500);
});

socket.on("chatEnded", (data) => {
  // Update stats immediately
  setStats(prev => ({
    ...prev,
    activeChats: Math.max(0, prev.activeChats - 1)
  }));
  
  // Update earnings if amount > 0
  if (data.totalAmount > 0) {
    setStats(prev => ({
      ...prev,
      totalEarnings: prev.totalEarnings + data.totalAmount,
      todayEarnings: prev.todayEarnings + data.totalAmount
    }));
  }
  // Sync with database
  setTimeout(() => fetchRealTimeStats(), 500);
})
  

  // --- CHAT EVENTS ---
  socket.on("newChat", (chat) => {
    const userName = chat.user?.username || "User";
    
    // Show notification with click handler
    toast.custom((t) => (
      <div className="bg-white p-4 rounded-xl shadow-2xl border-l-4 border-green-500 flex items-center gap-4 cursor-pointer"
           onClick={() => { 
             toast.dismiss(t.id); 
             setActiveTab("chat");
           }}>
        <div className="bg-green-100 p-2 rounded-full">
          <FaComments className="text-green-600"/>
        </div>
        <div>
          <h4 className="font-bold text-gray-800">New Chat Request</h4>
          <p className="text-sm text-gray-600">{userName} wants to chat</p>
        </div>
        <button className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm">
          Go to Chat
        </button>
      </div>
    ), { duration: 5000 });
    
    syncAllStats();
  });

  
  // --- WALLET UPDATES ---
  socket.on("walletUpdated", (data) => {
    syncAllStats();
  });

  return () => {
    socket.disconnect();
  };
}, [fetchRealTimeStats]);

  // 3. INITIAL LOAD
  useEffect(() => {
    const loadData = async () => {
        const id = localStorage.getItem("astrologer_id");
        const token = localStorage.getItem("astrologer_token");
        if(!id || !token) { router.push("/astrologer/login"); return; }

        apiAstrologer.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        try {
            const { data } = await apiAstrologer.get(`/astrologer/profile/${id}`);
            if(data.success) setAstrologer(data.astrologer);
            
            await fetchRealTimeStats(); // Get initial counts
        } catch(e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };
    loadData();
  }, [fetchRealTimeStats, router]);
  // Load astrologer data
  useEffect(() => {
    
    const checkAuthAndLoad = async () => {
      const astrologerId = localStorage.getItem("astrologer_id");
      const token = localStorage.getItem("astrologer_token");
      
      if (!astrologerId || !token) {
        toast.error("Please login first");
        router.push("/astrologer/login");
        return;
      }

      try {
        // Set default headers for API calls
        apiAstrologer.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        const [profileRes, statsRes] = await Promise.all([
          apiAstrologer.get(`/astrologer/profile/${astrologerId}`),
          apiAstrologer.get(`/astrologer/stats/${astrologerId}`)
        ]);

        if (profileRes.data.success) {
         
          
          setAstrologer(profileRes.data.astrologer);
          setReviewStats(profileRes.data.reviewStats)

        } else {
          toast.error("Failed to load profile");
        }

        if (statsRes.data.success) {
          console.log(statsRes.data)
          setStats(statsRes.data.stats);
        } else {
          toast.error("Failed to load statistics");
        }
      } catch (error) {
        console.error("Load data error:", error);
        if (error.response?.status === 401) {
          toast.error("Session expired. Please login again.");
          localStorage.clear();
          router.push("/astrologer/login");
        } else {
          toast.error("Failed to load dashboard");
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndLoad();
  }, [router]);

  // Handle availability toggle
  const handleToggleAvailability = async () => {
    if (!astrologer) return;
    
    setTogglingAvailability(true);
    try {
      const response = await apiAstrologer.post(
        `/astrologer/toggle-availability/${astrologer._id}`
      );

      if (response.data.success) {
        // Update local state
        setAstrologer(prev => ({
          ...prev,
          isAvailable: response.data.isAvailable,
          isBusy: !response.data.isAvailable // Also update busy status
        }));
        // Emit socket event
        socketRef.current.emit("astrologerAvailabilityChanged", {
          astrologerId: astrologer._id,
          isAvailable: response.data.isAvailable
        });
        
        
        toast.success(response.data.message || 
          `You are now ${response.data.isAvailable ? 'online' : 'offline'}`);
      } else {
        toast.error(response.data.message || "Failed to toggle availability");
      }
    } catch (error) {
      console.error("Toggle availability error:", error);
      toast.error(error.response?.data?.message || "Network error. Please try again.");
    } finally {
      setTogglingAvailability(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("astrologer_id");
    localStorage.removeItem("astrologer_token");
    toast.success("Logged out successfully");
    router.push("/Astrologer/login");
  };

  // Real-time stats refresh (optional)
  const refreshStats = async () => {
    if (!astrologer) return;
    
    try {
     const astrologerId = localStorage.getItem("astrologer_id");
    if (!astrologerId) return;

    
        const { data } = await apiAstrologer.get(`/astrologer/stats/${astrologerId}`);
        if (data.success) {
            setStats(prev => ({
                ...prev,
                ...data.stats,
                // Ensure specific counters are synced from DB, not just local +1
                activeChats: data.stats.activeChats || 0,
                waitingCalls: data.stats.waitingCalls || 0
            }));
          }
        
          }catch (error) {
      console.error("Refresh stats error:", error);
    }
  };

  // Auto-refresh stats every 30 seconds
  useEffect(() => {
    if (!astrologer) return;
    
    const interval = setInterval(() => {
      refreshStats();
    }, 30000); // 30 seconds
    
    return () => clearInterval(interval);
  }, [astrologer]);

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
                <p className="text-sm text-gray-500">{astrologer?.experienceYears || "0"} years exp</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status</span>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  astrologer?.isAvailable 
                    ? "bg-green-100 text-green-700" 
                    : "bg-red-100 text-red-700"
                }`}>
                  {astrologer?.isAvailable ? "🟢 Online" : "🔴 Offline"}
                </span>
                <button
                  onClick={handleToggleAvailability}
                  disabled={togglingAvailability}
                  className="p-1 hover:bg-gray-100 rounded"
                  title={astrologer?.isAvailable ? "Go Offline" : "Go Online"}
                >
                  {togglingAvailability ? (
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  ) : astrologer?.isAvailable ? (
                    <FaPowerOff className="text-red-500 text-sm" />
                  ) : (
                    <FiPower className="text-green-500 text-sm" />
                  )}
                </button>
              </div>
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
              badge={stats.activeChats + stats.waitingChats} // Sum of both
            />
            <NavItem
              icon={<FaPhone />}
              label="Calls"
              active={activeTab === "call"}
              onClick={() => {
                setActiveTab("call");
                if (typeof window.refreshCalls === 'function') {
                 window.refreshCalls()
              }
            }}
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
              icon={<FaUser />}
              label="Profile"
              active={activeTab === "profile"}
              onClick={() => setActiveTab("profile")}
            />
           
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
             
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Earnings</span>
                <span className="font-bold text-gray-800">₹{stats.totalEarnings}</span>
              </div>
            </div>
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
                {activeTab === "profile" && "Profile"}
                
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
                onClick={handleToggleAvailability}
                disabled={togglingAvailability}
                className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-all ${
                  astrologer?.isAvailable
                    ? "bg-red-100 text-red-600 hover:bg-red-200"
                    : "bg-green-100 text-green-600 hover:bg-green-200"
                } ${togglingAvailability ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {togglingAvailability ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Updating...
                  </>
                ) : astrologer?.isAvailable ? (
                  <>
                    <FaPowerOff />
                    Go Offline
                  </>
                ) : (
                  <>
                    <FiPower />
                    Go Online
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="p-4 lg:p-6">
            {activeTab === "overview" && <OverviewTab astrologer={astrologer} stats={stats} refreshStats={refreshStats} reviewStats={reviewStats} setActiveTab={setActiveTab}/>}
            {activeTab === "chat" && <ChatDashboard astrologerId={astrologer?._id} />}
            {activeTab === "call" && <CallDashboard astrologerId={astrologer?._id} />}
            {activeTab === "payouts" && <PayoutsDashboard astrologer={astrologer} stats={stats} />}
            {activeTab === "profile" && <ProfileTab astrologer={astrologer} />}
            {activeTab === "settings" && <SettingsTab astrologer={astrologer} />}
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

// Updated Overview Tab Component
// Updated OverviewTab component with real-time stats
function OverviewTab({ astrologer, stats, refreshStats, reviewStats, setActiveTab }) {
  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-[#003D33] to-[#00695C] rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Welcome back, {astrologer?.fullName}!</h2>
            <p className="text-white/80">
              {astrologer?.isAvailable 
                ? "You are currently online and receiving requests." 
                : "You are currently offline. Go online to receive requests."}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold">{reviewStats?.averageRating || "4.8"}</div>
              <div className="text-sm text-white/70">Rating</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{astrologer?.totalConsultations || 0}</div>
              <div className="text-sm text-white/70">Total Sessions</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Earnings"
          value={`₹${stats.totalEarnings || 0}`}
          icon="💰"
          color="green"
        />
        <StatCard
          title="Active Chats"
          value={stats.activeChats || 0}
          icon="💬"
          color="blue"
        />
        <StatCard
          title="Waiting Chats"
          value={stats.waitingChats || 0}
          icon="⏳"
          color="yellow"
        />
        <StatCard
          title="Waiting Calls"
          value={stats.waitingCalls || 0}
          icon="📞"
          color="purple"
        />
        <StatCard
          title="Pending Payout"
          value={`₹${stats.pendingPayouts || 0}`}
          icon="💳"
          color="orange"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="font-bold text-gray-800 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button 
              onClick={() => setActiveTab("chat")}
              className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <span className="font-medium text-gray-700">View Active Chats ({stats.activeChats})</span>
              <span className="text-[#C06014]">→</span>
            </button>
            <button 
              onClick={() => setActiveTab("call")}
              className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <span className="font-medium text-gray-700">Handle Waiting Calls ({stats.waitingCalls})</span>
              <span className="text-[#C06014]">→</span>
            </button>
            <button 
              onClick={() => setActiveTab("payouts")}
              className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <span className="font-medium text-gray-700">Withdraw Earnings (₹{stats.pendingPayouts})</span>
              <span className="text-[#C06014]">→</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800">Live Activity</h3>
            <button 
              onClick={refreshStats}
              className="text-sm text-[#C06014] hover:underline"
            >
              Refresh
            </button>
          </div>
          <div className="space-y-3">
            {stats.todayEarnings > 0 && (
              <ActivityItem time="Today" text={`Earned ₹${stats.todayEarnings} today`} />
            )}
            {stats.activeChats > 0 && (
              <ActivityItem time="Active" text={`${stats.activeChats} active chat${stats.activeChats > 1 ? 's' : ''}`} />
            )}
            {stats.waitingChats > 0 && (
              <ActivityItem time="Waiting" text={`${stats.waitingChats} waiting chat${stats.waitingChats > 1 ? 's' : ''}`} />
            )}
            {stats.waitingCalls > 0 && (
              <ActivityItem time="Waiting" text={`${stats.waitingCalls} waiting call${stats.waitingCalls > 1 ? 's' : ''}`} />
            )}
            <ActivityItem time="Status" text={`Currently ${astrologer?.isAvailable ? 'Online' : 'Offline'}`} />
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

// Updated Profile Tab Component
function ProfileTab({ astrologer }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Profile Settings</h2>
        
      </div>
      <div className="space-y-6">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-gradient-to-r from-[#C06014] to-[#D47C3A] rounded-full flex items-center justify-center text-white text-3xl font-bold">
            {astrologer?.fullName?.charAt(0) || "A"}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-800 text-xl mb-2">{astrologer?.fullName}</h3>
            <p className="text-gray-600">{astrologer?.email}</p>
            <p className="text-gray-600">{astrologer?.phone}</p>
            <div className="flex gap-4 mt-3">
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                {astrologer?.experienceYears || 0} years exp
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                astrologer?.isAvailable 
                  ? "bg-green-100 text-green-700" 
                  : "bg-red-100 text-red-700"
              }`}>
                {astrologer?.isAvailable ? "Online" : "Offline"}
              </span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-700">Professional Details</h4>
            <div className="space-y-2">
              <div>
                <label className="text-sm text-gray-500">Specialization</label>
                <p className="font-medium">{astrologer?.expertise?.[0] || "Vedic Astrology"}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Languages</label>
                <p className="font-medium">{astrologer?.languages?.join(", ") || "English, Hindi"}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Availability</label>
                <p className="font-medium">{astrologer?.availability || "Both"}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-700">Pricing</h4>
            <div className="space-y-2">
              <div>
                <label className="text-sm text-gray-500">Chat Rate</label>
                <p className="font-medium">₹{astrologer?.pricing?.chatPerMinute || 0}/min</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Call Rate</label>
                <p className="font-medium">₹{astrologer?.pricing?.callPerMinute || 0}/min</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsTab({ astrologer }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Settings</h2>
      <div className="space-y-6">
        <div>
          <h3 className="font-semibold text-gray-700 mb-4">Account Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-gray-500">Receive email alerts for new requests</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C06014]"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">SMS Notifications</p>
                <p className="text-sm text-gray-500">Receive SMS for urgent requests</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C06014]"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}