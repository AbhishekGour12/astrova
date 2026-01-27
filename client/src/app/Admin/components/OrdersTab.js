import { motion } from "framer-motion";
import { FaEye, FaTruck, FaFileExcel } from "react-icons/fa"; // Added FaFileExcel
import { adminAPI } from "../../lib/admin";
import { useEffect, useState, useMemo } from "react";
import * as XLSX from "xlsx"; // Added XLSX import

const OrdersTab = ({ orders: initialOrders = [], searchTerm = "" }) => {
  const [orders, setOrders] = useState(initialOrders);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const normalizeStatus = (status = "") =>
    status.toLowerCase().replace(/_/g, " ").trim();

  const LIMIT = 10;

  // 🔁 Fetch orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getAllOrders();
      if (res?.orders) {
        setOrders(res.orders);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter, dateRange.from, dateRange.to]);

  const getStatusColor = (status = "") => {
    const s = normalizeStatus(status);
    if (s === "delivered") return "bg-green-100 text-green-700";
    if (s === "out for delivery") return "bg-orange-100 text-orange-700";
    if (["in transit", "reached at hub"].includes(s))
      return "bg-blue-100 text-blue-700";
    if (["picked up", "out for pickup"].includes(s))
      return "bg-purple-100 text-purple-700";
    if (s.includes("rto")) return "bg-red-100 text-red-700";
    if (s.includes("cancel")) return "bg-red-100 text-red-700";
    return "bg-amber-100 text-amber-700";
  };

  // 🔎 Filtering
  const filteredOrders = useMemo(() => {
    const s = searchTerm.toLowerCase().trim();

    return orders.filter((order) => {
      const user = order.userId || {};
      const shipStatus = (order.shiprocketStatus || "").toLowerCase();
      const created = new Date(order.createdAt);

      const matchesSearch =
        !s ||
        (user.username || user.name || "").toLowerCase().includes(s) ||
        (user.email || "").toLowerCase().includes(s) ||
        (user.phone || "").toLowerCase().includes(s) ||
        (order._id || "").toLowerCase().includes(s) ||
        (order.shiprocketOrderId || "").toLowerCase().includes(s);

      const matchesStatus =
        statusFilter === "all" ||
        shipStatus.includes(statusFilter.toLowerCase());

      let matchesDate = true;
      if (dateRange.from) {
        const from = new Date(dateRange.from);
        matchesDate = matchesDate && created >= from;
      }
      if (dateRange.to) {
        const to = new Date(dateRange.to);
        to.setHours(23, 59, 59, 999);
        matchesDate = matchesDate && created <= to;
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [orders, searchTerm, statusFilter, dateRange]);

  // 📊 EXPORT TO EXCEL FUNCTION
  const handleExport = () => {
    if (!filteredOrders.length) {
      alert("No orders to export!");
      return;
    }

    // 1. Flatten the data for Excel columns
    const dataToExport = filteredOrders.map((order) => {
      const user = order.userId || {};
      const address = order.shippingAddress || {};
      
      // Helper to format items string safely
      const itemsString = Array.isArray(order.items) 
        ? order.items.map(i => `${i.product?.name || 'Item'} (x${i.quantity})`).join(", ") 
        : "No Items";

      return {
        "Order ID": order._id,
        "Date": new Date(order.createdAt).toLocaleDateString(),
        "Time": new Date(order.createdAt).toLocaleTimeString(),
        "Customer Name": user.username || user.name || "Unknown",
        "Customer Email": user.email || address.email || "",
        "Customer Phone": user.phone || address.phone || "",
        "Shipping Address": `${address.addressLine1 || ""} ${address.addressLine2 || ""}, ${address.city || ""} ${address.state || ""} - ${address.pincode || ""}`.trim(),
        "Items Summary": itemsString,
        "Total Items": Array.isArray(order.items) ? order.items.reduce((acc, curr) => acc + (curr.quantity || 0), 0) : 0,
        "Total Amount (INR)": order.totalAmount || 0,
        "Payment Method": order.paymentMethod,
        "Payment Status": order.paymentStatus,
        "Shiprocket Status": order.shiprocketStatus || "Pending",
        "AWB Code": order.awbCode || "N/A"
      };
    });

    // 2. Create Workbook
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

    // 3. Save File
    XLSX.writeFile(workbook, `Orders_Export_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  // ... (Existing Pagination logic)
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / LIMIT));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * LIMIT;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + LIMIT);

  const handleChangePage = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages) return;
    setPage(nextPage);
  };

  const handleTrackShipment = (order) => {
    if (!order.awbCode) {
      alert("AWB not assigned yet.");
      return;
    }
    window.open(
      `https://shiprocket.co/tracking/${order.awbCode}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // ... (Existing Helpers: getItemsSummary, totalItemCount, getProgressStep, mapAdminReadableStatus)
  const getItemsSummary = (order) => {
    const items = Array.isArray(order.items) ? order.items : [];
    if (!items.length) {
      if (order.items && typeof order.items !== "object") return String(order.items);
      return "No items";
    }
    const first = items[0];
    const name = first?.product?.name || first?.productName || "Item";
    if (items.length === 1) return `${name} (x${first.quantity || 1})`;
    return `${name} (x${first.quantity || 1}) + ${items.length - 1} more`;
  };

  const totalItemCount = (order) => {
    const items = Array.isArray(order.items) ? order.items : [];
    if (!items.length) {
      if (typeof order.items === "number") return order.items;
      return 0;
    }
    return items.reduce((sum, i) => sum + (i.quantity || 0), 0);
  };

  const getProgressStep = (status = "") => {
    const s = normalizeStatus(status);
    if (["pickup scheduled"].includes(s)) return 1;
    if (["picked up", "out for pickup"].includes(s)) return 2;
    if (["shipped", "in transit", "reached at hub"].includes(s)) return 3;
    if (["out for delivery"].includes(s)) return 4;
    if (["delivered"].includes(s)) return 5;
    return 0;
  };

  const mapAdminReadableStatus = (status = "") => {
    const s = normalizeStatus(status);
    if (["order created", "pending"].includes(s)) return "Order Created";
    if (["pickup scheduled"].includes(s)) return "Pickup Scheduled";
    if (["out for pickup", "picked up"].includes(s)) return "Picked Up";
    if (["shipped", "in transit", "reached at hub", "departed hub"].includes(s)) return "In Transit";
    if (["out for delivery"].includes(s)) return "Out for Delivery";
    if (["delivered"].includes(s)) return "Delivered";
    if (s.includes("rto")) return "RTO / Returned";
    if (s.includes("cancel")) return "Cancelled";
    return "Processing";
  };

  return (
    <div className="space-y-6">
      {/* Header + Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold text-[#003D33]">
            Order Management
          </h2>
          <p className="text-[#00695C] text-sm lg:text-base">
            Manage all customer orders & Shiprocket shipments
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#B2C5B2] text-sm text-[#003D33] bg-white"
          >
            <option value="all">All Status</option>
            <option value="pickup scheduled">Pickup Scheduled</option>
            <option value="picked up">Picked Up</option>
            <option value="out for pickup">Out for Pickup</option>
            <option value="in transit">In Transit</option>
            <option value="out for delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="rto">RTO</option>
            <option value="cancel">Cancelled</option>
          </select>

          {/* Date Filters */}
          <div className="flex gap-2">
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, from: e.target.value }))
              }
              className="px-3 py-2 rounded-xl border border-[#B2C5B2] text-sm text-[#003D33] bg-white"
            />
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, to: e.target.value }))
              }
              className="px-3 py-2 rounded-xl border border-[#B2C5B2] text-sm text-[#003D33] bg-white"
            />
          </div>

          {/* Count + Refresh + EXPORT Button */}
          <div className="flex items-center gap-2">
            <span className="text-[#00695C] bg-[#ECE5D3] px-4 py-1 rounded-full text-sm hidden xl:inline-block">
              {filteredOrders.length} orders
            </span>

            {/* 🔥 Export Button */}
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#2e7d32] hover:bg-[#1b5e20] text-white text-sm transition-colors"
              title="Download Excel"
            >
              <FaFileExcel className="text-base" />
              <span className="hidden md:inline">Export</span>
            </button>

            <button
              onClick={fetchOrders}
              disabled={loading}
              className="px-3 py-2 rounded-xl bg-[#003D33] text-white text-sm disabled:opacity-50"
            >
              {loading ? "..." : "Refresh"}
            </button>
          </div>
        </div>
      </div>

      {/* 🌐 Desktop Table */}
      <div className="hidden sm:block bg-white border rounded-2xl shadow-sm overflow-hidden">
        <div className="max-h-[calc(100vh-260px)] overflow-y-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead className="bg-[#F7F3E9] sticky top-0 z-10">
              <tr className="text-[#003D33]">
                <th className="px-4 py-3 text-left">Order</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Items</th>
                <th className="px-4 py-3 text-left">Amount</th>
                <th className="px-4 py-3 text-left">Payment</th>
                <th className="px-4 py-3 text-left">Shiprocket</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginatedOrders.map((order) => {
                const user = order.userId || {};
                const shipStatus = order.shiprocketStatus || "Pending";
                return (
                  <motion.tr
                    key={order._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-t hover:bg-[#FAF7F0]"
                  >
                    {/* Order ID */}
                    <td className="px-4 py-3 font-semibold text-[#003D33]">
                      #{order._id.slice(-6)}
                      <div className="text-xs text-[#00695C]">
                        SR: {order.shiprocketOrderId || "—"}
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="px-4 py-3">
                      <p className="font-medium">
                        {user.username || user.name || "Unknown User"}
                      </p>
                      <p className="text-xs text-[#00695C] line-clamp-1">
                        {user.email || order.shippingAddress?.email || "—"}
                      </p>
                      <p className="text-xs text-[#00695C]">
                        {user.phone || order.shippingAddress?.phone || ""}
                      </p>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 text-[#00695C]">
                      {new Date(order.createdAt).toLocaleDateString()}
                      <div className="text-xs">
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </div>
                    </td>

                    {/* Items */}
                    <td className="px-4 py-3 text-xs text-[#003D33]">
                      <div>{getItemsSummary(order)}</div>
                      <div className="text-[11px] text-[#00695C]">
                        {totalItemCount(order)} item(s)
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-3 text-[#C06014] font-bold">
                      ₹{order.totalAmount?.toFixed(2)}
                      <div className="text-[11px] text-[#00695C]">
                        Subtotal: ₹{order.subtotal?.toFixed(2)} + GST: ₹
                        {order.gstAmount?.toFixed(2)}
                      </div>
                    </td>

                    {/* Payment */}
                    <td className="px-4 py-3 text-xs">
                      <div className="font-semibold text-[#003D33]">
                        {order.paymentMethod === "online" ? "Prepaid" : "COD"}
                      </div>
                      <div
                        className={`mt-1 inline-block px-2 py-1 rounded-full ${
                          order.paymentStatus === "Paid"
                            ? "bg-green-100 text-green-700"
                            : order.paymentStatus === "Failed"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {order.paymentStatus || "Pending"}
                      </div>
                    </td>

                    {/* Shiprocket Status */}
                    <td className="px-4 py-3 text-xs">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          mapAdminReadableStatus(shipStatus)
                        )}`}
                      >
                        {mapAdminReadableStatus(shipStatus)}
                      </span>
                      <div className="text-[11px] text-gray-500 mt-1">
                        Courier: {shipStatus}
                      </div>
                      <div className="text-[11px] text-[#00695C] mt-1">
                        AWB: {order.awbCode || "—"}
                      </div>
                      <div className="flex gap-1 mt-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span
                            key={i}
                            className={`h-1.5 w-5 rounded-full ${
                              i < getProgressStep(shipStatus)
                                ? "bg-[#C06014]"
                                : "bg-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <ActionIcon
                          icon={<FaEye />}
                          tooltip="View details"
                          onClick={() => setSelectedOrder(order)}
                        />
                        <ActionIcon
                          icon={<FaTruck />}
                          tooltip="Track shipment"
                          onClick={() => handleTrackShipment(order)}
                        />
                      </div>
                    </td>
                  </motion.tr>
                );
              })}

              {!paginatedOrders.length && (
                <tr>
                  <td
                    colSpan="8"
                    className="text-center text-sm text-[#00695C] py-6"
                  >
                    No orders found for selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex justify-between items-center gap-3 px-4 py-3 bg-[#F7F3E9] border-t border-[#B2C5B2] text-sm">
          <div className="text-[#00695C]">
            Showing{" "}
            <span className="font-semibold">
              {filteredOrders.length ? startIndex + 1 : 0}-
              {Math.min(startIndex + LIMIT, filteredOrders.length)}
            </span>{" "}
            of <span className="font-semibold">{filteredOrders.length}</span>{" "}
            orders
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleChangePage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-lg bg-[#003D33] text-white disabled:opacity-40"
            >
              Prev
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => handleChangePage(i + 1)}
                className={`px-2.5 py-1 rounded-lg border text-xs ${
                  currentPage === i + 1
                    ? "bg-[#C06014] text-white border-[#C06014]"
                    : "text-[#003D33] border-[#B2C5B2]"
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => handleChangePage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-lg bg-[#003D33] text-white disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* 📱 Mobile Cards */}
      <div className="grid sm:hidden gap-4">
        {paginatedOrders.map((order) => {
          const user = order.userId || {};
          const shipStatus = order.shiprocketStatus || "Pending";
          return (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-4 rounded-2xl shadow border"
            >
              <div className="flex justify-between">
                <h3 className="font-semibold text-[#003D33] text-sm">
                  #{order._id.slice(-6)}
                </h3>
                <span className="text-xs font-semibold text-[#C06014]">
                  ₹{order.totalAmount?.toFixed(2)}
                </span>
              </div>

              <p className="text-sm text-[#00695C] mt-1">
                {user.username || user.name || "Unknown User"}
              </p>

              <div className="flex justify-between mt-2 text-xs text-[#00695C]">
                <span>{totalItemCount(order)} item(s)</span>
                <span>
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="mt-3 space-y-1">
                <span
                  className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                    mapAdminReadableStatus(shipStatus)
                  )}`}
                >
                  {mapAdminReadableStatus(shipStatus)}
                </span>
                <p className="text-[11px] text-gray-500">
                  Courier: {shipStatus}
                </p>
                <div className="flex gap-1 mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 flex-1 rounded-full ${
                        i < getProgressStep(shipStatus)
                          ? "bg-[#C06014]"
                          : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 🔍 Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};

/* 🔽 Helper Components */
const ActionIcon = ({ icon, onClick, tooltip }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    title={tooltip}
    className="p-2 rounded-lg bg-[#ECE5D3] text-[#003D33] hover:bg-[#C06014] hover:text-white transition"
  >
    {icon}
  </motion.button>
);

const OrderDetailsModal = ({ order, onClose }) => {
  const user = order.userId || {};
  const items = order.items || [];

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
      >
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#B2C5B2]">
          <div>
            <h3 className="text-xl font-bold text-[#003D33]">
              Order #{order._id.slice(-6)}
            </h3>
            <p className="text-xs text-[#00695C] mt-1">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-sm px-3 py-1 rounded-xl bg-[#F7F3E9] text-[#003D33]"
          >
            Close
          </button>
        </div>

        <div className="px-6 py-4 space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-[#F7F3E9] rounded-2xl p-4">
              <h4 className="font-semibold text-[#003D33] mb-2">Customer</h4>
              <p className="text-sm text-[#003D33]">
                {user.username || user.name || "Unknown User"}
              </p>
              <p className="text-xs text-[#00695C]">
                {user.email || order.shippingAddress?.email || "—"}
              </p>
              <p className="text-xs text-[#00695C]">
                {user.phone || order.shippingAddress?.phone || "—"}
              </p>
            </div>

            <div className="bg-[#F7F3E9] rounded-2xl p-4">
              <h4 className="font-semibold text-[#003D33] mb-2">
                Shipping Address
              </h4>
              <p className="text-sm text-[#003D33]">
                {order.shippingAddress?.fullName}
              </p>
              <p className="text-xs text-[#003D33]">
                {order.shippingAddress?.addressLine1}
              </p>
              {order.shippingAddress?.addressLine2 && (
                <p className="text-xs text-[#003D33]">
                  {order.shippingAddress.addressLine2}
                </p>
              )}
              <p className="text-xs text-[#003D33]">
                {order.shippingAddress?.city}, {order.shippingAddress?.state} -{" "}
                {order.shippingAddress?.pincode}
              </p>
              <p className="text-xs text-[#00695C]">
                AWB:{" "}
                <span className="font-semibold">{order.awbCode || "—"}</span>
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-[#003D33] mb-2">Items</h4>
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 bg-[#F7F3E9] rounded-2xl px-3 py-2"
                >
                  <img
                    src={
                      item.product?.imageUrls?.[0]
                        ? `${process.env.NEXT_PUBLIC_API}${item.product.imageUrls[0]}`
                        : "/placeholder.png"
                    }
                    alt={item.product?.name || "Product"}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#003D33]">
                      {item.product?.name || "Product"}
                    </p>
                    <p className="text-xs text-[#00695C]">
                      Qty: {item.quantity} × ₹{item.product?.price}
                    </p>
                  </div>
                  <div className="text-sm font-semibold text-[#C06014]">
                    ₹{(item.quantity * (item.product?.price || 0)).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#F7F3E9] rounded-2xl p-4 flex flex-col sm:flex-row sm:justify-between gap-3">
            <div className="text-sm text-[#003D33] space-y-1">
              <p>
                Subtotal:{" "}
                <span className="font-semibold">
                  ₹{order.subtotal?.toFixed(2)}
                </span>
              </p>
              <p>
                GST:{" "}
                <span className="font-semibold">
                  ₹{order.gstAmount?.toFixed(2)}
                </span>
              </p>
              <p>
                Shipping:{" "}
                <span className="font-semibold">
                  ₹{order.shippingCharge?.toFixed(2)}
                </span>
              </p>
              {order.discount ? (
                <p>
                  Discount:{" "}
                  <span className="font-semibold text-green-700">
                    -₹{order.discount?.toFixed(2)}
                  </span>
                </p>
              ) : null}
            </div>

            <div className="text-right">
              <p className="text-xs text-[#00695C]">Total Amount</p>
              <p className="text-xl font-bold text-[#C06014]">
                ₹{order.totalAmount?.toFixed(2)}
              </p>
              <p className="text-xs mt-2 text-[#00695C]">
                Payment: {order.paymentMethod === "online" ? "Prepaid" : "COD"}{" "}
                ({order.paymentStatus || "Pending"})
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OrdersTab;