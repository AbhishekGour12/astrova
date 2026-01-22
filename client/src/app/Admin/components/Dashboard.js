"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaUsers, FaUserAstronaut, FaShoppingBag, FaDollarSign,
  FaBox, FaClock, FaDownload, FaRupeeSign
} from "react-icons/fa";
import { ChartLoader } from "./Loading"; // Assuming you have this
import api from "../../lib/api"; // Your Axios instance
import * as XLSX from 'xlsx'; // For Excel export
import { saveAs } from 'file-saver'; // For file download

// Import Recharts components
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, AreaChart, Area
} from 'recharts';

// Custom Tooltip for Recharts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-800">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: <span className="font-bold">₹{entry.value.toLocaleString()}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Revenue Chart Component with Recharts
const RevenueChart = ({ data, period }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-gray-400">
        <div className="text-4xl mb-2">📊</div>
        <p>No revenue data available</p>
      </div>
    );
  }

  // Format data based on period
  const formattedData = data.map(item => ({
    ...item,
    revenue: Number(item.revenue) || 0,
    // Add a formatted label for display
    displayLabel: period === 'day' ? `Day ${item.label}` : item.label
  }));

  // Choose chart type based on period
  const isTimeSeries = ['day', 'week'].includes(period);
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      {isTimeSeries ? (
        <AreaChart
          data={formattedData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="displayLabel" 
            angle={-45}
            textAnchor="end"
            height={60}
            fontSize={12}
            tick={{ fill: '#666' }}
          />
          <YAxis 
            fontSize={12}
            tick={{ fill: '#666' }}
            tickFormatter={(value) => `₹${(value/1000)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Area
            type="monotone"
            dataKey="revenue"
            name="Revenue"
            stroke="#00695C"
            fill="url(#colorRevenue)"
            strokeWidth={2}
            fillOpacity={0.3}
          />
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00695C" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#00695C" stopOpacity={0}/>
            </linearGradient>
          </defs>
        </AreaChart>
      ) : (
        <BarChart
          data={formattedData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="displayLabel" 
            angle={period === 'year' ? 0 : -45}
            textAnchor={period === 'year' ? 'middle' : 'end'}
            height={60}
            fontSize={12}
            tick={{ fill: '#666' }}
          />
          <YAxis 
            fontSize={12}
            tick={{ fill: '#666' }}
            tickFormatter={(value) => `₹${(value/1000)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar
            dataKey="revenue"
            name="Revenue"
            fill="#00695C"
            radius={[4, 4, 0, 0]}
            animationDuration={1500}
            animationEasing="ease-out"
          />
        </BarChart>
      )}
    </ResponsiveContainer>
  );
};

const Dashboard = () => {
  // 1. Stats State
  const [stats, setStats] = useState({
    usersCount: 0, astrologersCount: 0, productsCount: 0,
    totalRevenue: 0, totalOrders: 0, pendingOrders: 0,
    todaysRevenue: 0, revenueGrowth: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // 2. Chart State
  const [chartData, setChartData] = useState([]);
  const [chartPeriod, setChartPeriod] = useState('month'); // day, week, month, year
  const [chartLoading, setChartLoading] = useState(false);

  // Initial Load
  useEffect(() => {
    fetchDashboardStats();
  }, []);

  // Fetch Chart when Period Changes
  useEffect(() => {
    fetchRevenueAnalytics();
  }, [chartPeriod]);

  // Fetch Main Stats
  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/stats'); // Calls getDashboardStats
      
      if (response.data.success) {
        const { overview, recentOrders } = response.data.data;
        setStats({
          usersCount: overview.usersCount,
          astrologersCount: overview.astrologersCount,
          productsCount: overview.productsCount,
          totalRevenue: overview.totalRevenue,
          totalOrders: overview.totalOrders,
          pendingOrders: overview.pendingOrders,
          todaysRevenue: overview.todaysRevenue,
          revenueGrowth: overview.revenueGrowth
        });
        setRecentOrders(recentOrders || []);
      }
    } catch (error) {
      console.error('Stats error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Chart Data Separate API
  const fetchRevenueAnalytics = async () => {
    try {
      setChartLoading(true);
      // Calls getRevenueAnalytics with query param
      const response = await api.get(`/admin/revenue-analytics?period=${chartPeriod}`);
      
      if (response.data.success) {
        setChartData(response.data.data.analytics || []);
      }
    } catch (error) {
      console.error('Analytics error:', error);
      setChartData([]);
    } finally {
      setChartLoading(false);
    }
  };

  // Export to Excel Function
  const exportToExcel = async () => {
    try {
      // Create workbook
      const wb = XLSX.utils.book_new();
      
      // Prepare dashboard summary sheet
      const summaryData = [
        ["My Astrova Dashboard Report", "", "", ""],
        ["Generated on", new Date().toLocaleString()],
        [],
        ["DASHBOARD SUMMARY"],
        ["Metric", "Value"],
        ["Total Users", stats.usersCount],
        ["Total Astrologers", stats.astrologersCount],
        ["Total Products", stats.productsCount],
        ["Total Revenue", `₹${stats.totalRevenue.toLocaleString()}`],
        ["Total Orders", stats.totalOrders],
        ["Pending Orders", stats.pendingOrders],
        ["Today's Revenue", `₹${stats.todaysRevenue.toLocaleString()}`],
        ["Revenue Growth", `${stats.revenueGrowth}%`],
        [],
        ["REVENUE ANALYTICS", "", "", ""],
        ["Period", chartPeriod],
        ["Date/Label", "Revenue (₹)"],
      ];

      // Add chart data
      chartData.forEach(item => {
        summaryData.push([item.label, item.revenue]);
      });

      summaryData.push([], ["RECENT ORDERS"], ["Order Number", "Customer", "Amount", "Status"]);

      // Add recent orders data
      recentOrders.forEach(order => {
        summaryData.push([
          order.orderNumber,
          order.userName,
          order.totalAmount,
          order.orderStatus
        ]);
      });

      const ws = XLSX.utils.aoa_to_sheet(summaryData);
      
      // Style columns
      const wscols = [
        { wch: 20 }, // Column A width
        { wch: 25 }, // Column B width
        { wch: 15 }, // Column C width
        { wch: 15 }, // Column D width
      ];
      ws['!cols'] = wscols;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, "Dashboard Report");

      // Generate Excel file
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
      
      // Convert to blob and download
      const buf = new ArrayBuffer(wbout.length);
      const view = new Uint8Array(buf);
      for (let i = 0; i < wbout.length; i++) {
        view[i] = wbout.charCodeAt(i) & 0xFF;
      }
      const blob = new Blob([buf], { type: 'application/octet-stream' });
      
      // Download file
      saveAs(blob, `MyAstrova_Dashboard_${new Date().toISOString().split('T')[0]}.xlsx`);

      // Show success message (you can replace with toast notification)
      alert('Report exported successfully!');
      
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export report. Please try again.');
    }
  };

  const statusColor = {
    Pending: "bg-amber-100 text-amber-700",
    Shipped: "bg-indigo-100 text-indigo-700",
    Delivered: "bg-green-100 text-green-700",
    Cancelled: "bg-red-100 text-red-700",
    confirmed: "bg-blue-100 text-blue-700"
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#003D33]">My Astrova Dashboard</h2>
          <p className="text-[#00695C] text-sm">Welcome to your spiritual management center</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={exportToExcel}
          className="flex items-center gap-2 px-4 py-2 bg-[#00695C] text-white rounded-xl text-sm hover:bg-[#004D40] transition-colors shadow-md"
        >
          <FaDownload /> Export Report
        </motion.button>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {[
          { icon: FaUsers, value: stats.usersCount, label: "Users", color: "from-blue-500 to-cyan-500", sub: "Total registered" },
          { icon: FaUserAstronaut, value: stats.astrologersCount, label: "Astrologers", color: "from-purple-500 to-pink-500", sub: "Approved experts" },
          { icon: FaShoppingBag, value: stats.productsCount, label: "Products", color: "from-green-500 to-emerald-500", sub: "Active items" },
          { 
            icon: FaRupeeSign, 
            value: `₹${stats.totalRevenue.toLocaleString()}`, 
            label: "Total Revenue", 
            color: "from-amber-500 to-orange-500", 
            sub: `Growth: ${stats.revenueGrowth > 0 ? '+' : ''}${stats.revenueGrowth}%` 
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="flex justify-between items-start">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center text-white text-xl`}>
                <stat.icon />
              </div>
              {stat.label === "Total Revenue" && (
                 <span className={`text-xs font-bold px-2 py-1 rounded ${stats.revenueGrowth >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                   {stats.revenueGrowth >= 0 ? '↑' : '↓'} {stats.revenueGrowth}%
                 </span>
              )}
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-bold text-[#003D33]">{stat.value}</h3>
              <p className="text-gray-500 text-sm">{stat.label}</p>
              <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Middle Section: Chart & Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Chart (Takes up 2 cols) */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-3">
            <h3 className="text-lg font-semibold text-[#003D33]">Revenue Analytics</h3>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">Period:</span>
              <select 
                value={chartPeriod}
                onChange={(e) => setChartPeriod(e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-[#00695C] focus:border-transparent outline-none transition"
              >
                <option value="day">Last 30 Days</option>
                <option value="week">Weekly</option>
                <option value="month">Last 6 Months</option>
                <option value="year">Yearly</option>
              </select>
            </div>
          </div>
          
          <div className="h-64 md:h-80">
            {chartLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00695C] mx-auto"></div>
                  <p className="mt-3 text-gray-500">Loading revenue data...</p>
                </div>
              </div>
            ) : (
              <RevenueChart data={chartData} period={chartPeriod} />
            )}
          </div>
          
          {/* Chart Summary */}
          {chartData.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#00695C]"></div>
                  <span className="text-gray-600">Total Period Revenue:</span>
                  <span className="font-bold text-[#003D33]">
                    ₹{chartData.reduce((sum, item) => sum + (Number(item.revenue) || 0), 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#4DB6AC]"></div>
                  <span className="text-gray-600">Data Points:</span>
                  <span className="font-bold text-[#003D33]">{chartData.length}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Recent Orders (Takes up 1 col) */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-[#003D33]">Recent Orders</h3>
            <button className="text-xs text-[#C06014] font-medium hover:underline transition">
              View All
            </button>
          </div>

          <div className="overflow-y-auto pr-1 space-y-3 flex-1 max-h-[300px] custom-scrollbar">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <motion.div 
                  key={order._id} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-3 bg-gray-50 rounded-xl flex justify-between items-center group hover:bg-[#F7F3E9] transition-all cursor-pointer"
                >
                  <div>
                    <p className="font-bold text-[#003D33] text-sm">{order.orderNumber}</p>
                    <p className="text-xs text-gray-500 truncate max-w-[120px]">{order.userName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#C06014] text-sm">₹{order.totalAmount}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusColor[order.orderStatus] || "bg-gray-200"}`}>
                      {order.orderStatus || 'Pending'}
                    </span>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-10">
                <div className="text-4xl mb-2">📦</div>
                <p className="text-gray-400 text-sm">No recent orders</p>
              </div>
            )}
          </div>
          
          {/* Orders Summary */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between text-sm">
              <div>
                <p className="text-gray-500">Total Orders</p>
                <p className="font-bold text-lg text-[#003D33]">{stats.totalOrders}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-500">Pending</p>
                <p className="font-bold text-lg text-amber-600">{stats.pendingOrders}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;