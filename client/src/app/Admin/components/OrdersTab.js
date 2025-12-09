import { motion } from "framer-motion";
import { FaEye, FaTruck } from "react-icons/fa";
import { adminAPI } from "../../lib/admin";
import { useEffect, useState, useMemo } from "react";

const OrdersTab = ({ orders: initialOrders = [], searchTerm = "" }) => {
  const [orders, setOrders] = useState(initialOrders);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null); // for "View details" modal

  const LIMIT = 10; // 10 orders per page

  // 🔁 Fetch orders from backend
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getAllOrders(); // must return { orders: [...] }
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

  // Reset to page 1 whenever filter/search changes
  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter, dateRange.from, dateRange.to]);

  // 🌈 Status badge color classes based on shiprocketStatus
  const getStatusColor = (status = "") => {
    const s = status.toLowerCase();
    if (s.includes("delivered")) return "bg-green-100 text-green-700";
    if (s.includes("transit")) return "bg-blue-100 text-blue-700";
    if (s.includes("shipped")) return "bg-indigo-100 text-indigo-700";
    if (s.includes("created") || s.includes("order")) return "bg-amber-100 text-amber-700";
    if (s.includes("cancel")) return "bg-red-100 text-red-700";
    if (s.includes("pending")) return "bg-gray-100 text-gray-700";
    return "bg-gray-100 text-gray-700";
  };

  // 🔎 Filtering (search + status + date range)
  const filteredOrders = useMemo(() => {
    const s = searchTerm.toLowerCase().trim();

    return orders.filter((order) => {
      const user = order.userId || {};
      const shipStatus = (order.shiprocketStatus || "").toLowerCase();
      const created = new Date(order.createdAt);

      // search on: user name, email, phone, order id, shiprocketOrderId
      const matchesSearch =
        !s ||
        (user.fullName || user.name || "")
          .toLowerCase()
          .includes(s) ||
        (user.email || "").toLowerCase().includes(s) ||
        (user.phone || "").toLowerCase().includes(s) ||
        (order._id || "").toLowerCase().includes(s) ||
        (order.shiprocketOrderId || "").toLowerCase().includes(s);

      // status filter
      const matchesStatus =
        statusFilter === "all" ||
        shipStatus.includes(statusFilter.toLowerCase());

      // date filter
      let matchesDate = true;
      if (dateRange.from) {
        const from = new Date(dateRange.from);
        matchesDate = matchesDate && created >= from;
      }
      if (dateRange.to) {
        const to = new Date(dateRange.to);
        // include full day
        to.setHours(23, 59, 59, 999);
        matchesDate = matchesDate && created <= to;
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [orders, searchTerm, statusFilter, dateRange]);

  // 📄 Pagination
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / LIMIT));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * LIMIT;
  const paginatedOrders = filteredOrders.slice(
    startIndex,
    startIndex + LIMIT
  );

  const handleChangePage = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages) return;
    setPage(nextPage);
  };

  // 🟢 Update Shiprocket Status (local + backend)
  const handleUpdateShiprocketStatus = async (orderId, newStatus) => {
    // Optimistic UI update
    setOrders((prev) =>
      prev.map((o) =>
        o._id === orderId ? { ...o, shiprocketStatus: newStatus } : o
      )
    );

    try {
      // 👉 Make sure this API exists in adminAPI
      // e.g. PATCH /admin/orders/:id/status  { shiprocketStatus }
      await adminAPI.updateOrderStatus(orderId, {
        shiprocketStatus: newStatus,
      });
    } catch (err) {
      console.error("Failed to update status:", err);
      // Rollback on error
      await fetchOrders();
    }
  };

  // 🚚 Track shipment (Shiprocket Tracking)
  const handleTrackShipment = (order) => {
    const awb = order.awbCode || order.shiprocketAWB;
    const shipId = order.shiprocketOrderId || order.shipmentId;

    if (!awb && !shipId) {
      alert("No AWB or Shiprocket Order ID available for tracking.");
      return;
    }

    const code = awb || shipId;
    const url = `https://shiprocket.co/tracking/${code}`;
    if (typeof window !== "undefined") {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  // 📦 Items summary (for table)
 
const getItemsSummary = (order) => {
  const items = Array.isArray(order.items) ? order.items : [];

  if (!items.length) {
    // maybe some old orders just stored a string / number in `items`
    if (order.items && typeof order.items !== "object") {
      return String(order.items);
    }
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
    // if backend stored a number like `items: 3`
    if (typeof order.items === "number") return order.items;
    return 0;
  }

  return items.reduce((sum, i) => sum + (i.quantity || 0), 0);
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
            <option value="pending">Pending</option>
            <option value="order created">Order Created</option>
            <option value="shipped">Shipped</option>
            <option value="transit">In Transit</option>
            <option value="delivered">Delivered</option>
            <option value="cancel">Cancelled</option>
          </select>

          {/* Date Filters */}
          <div className="flex gap-2">
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) =>
                setDateRange((prev) => ({
                  ...prev,
                  from: e.target.value,
                }))
              }
              className="px-3 py-2 rounded-xl border border-[#B2C5B2] text-sm text-[#003D33] bg-white"
            />
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) =>
                setDateRange((prev) => ({
                  ...prev,
                  to: e.target.value,
                }))
              }
              className="px-3 py-2 rounded-xl border border-[#B2C5B2] text-sm text-[#003D33] bg-white"
            />
          </div>

          {/* Count + Refresh */}
          <div className="flex items-center gap-2">
            <span className="text-[#00695C] bg-[#ECE5D3] px-4 py-1 rounded-full text-sm">
              {filteredOrders.length} orders
            </span>
            <button
              onClick={fetchOrders}
              disabled={loading}
              className="px-3 py-2 rounded-xl bg-[#003D33] text-white text-sm disabled:opacity-50"
            >
              {loading ? "Refreshing..." : "Refresh"}
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
                        {order.paymentMethod === "razorpay"
                          ? "Prepaid"
                          : "COD"}
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
                      <StatusDropdown
                        order={order}
                        shipStatus={shipStatus}
                        getStatusColor={getStatusColor}
                        onUpdateStatus={handleUpdateShiprocketStatus}
                      />
                      <div className="text-[11px] text-[#00695C] mt-1">
                        AWB: {order.awbCode || order.shiprocketAWB || "—"}
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
                {user.fullName || user.name || "Unknown User"}
              </p>

              <div className="flex justify-between mt-2 text-xs text-[#00695C]">
                <span>{totalItemCount(order)} item(s)</span>
                <span>
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="flex justify-between items-center gap-2 mt-3">
                <StatusDropdown
                  order={order}
                  shipStatus={shipStatus}
                  getStatusColor={getStatusColor}
                  onUpdateStatus={handleUpdateShiprocketStatus}
                  small
                />
                <div className="flex gap-2 text-xs">
                  <ActionIcon
                    icon={<FaEye />}
                    onClick={() => setSelectedOrder(order)}
                  />
                  <ActionIcon
                    icon={<FaTruck />}
                    onClick={() => handleTrackShipment(order)}
                  />
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

/* 🔽 Status Dropdown Component (Shiprocket Status) */
const StatusDropdown = ({
  order,
  shipStatus,
  getStatusColor,
  onUpdateStatus,
  small = false,
}) => {
  const options = [
    "Pending",
    "Order Created",
    "Shipped",
    "In Transit",
    "Delivered",
    "Cancelled",
  ];

  return (
    <select
      value={shipStatus}
      onChange={(e) => onUpdateStatus(order._id, e.target.value)}
      className={`px-2 py-1 rounded-lg text-xs font-semibold border-none outline-none w-full ${
        getStatusColor(shipStatus)
      } ${small ? "text-[11px]" : ""}`}
    >
      {options.map((st) => (
        <option key={st} value={st}>
          {st}
        </option>
      ))}
    </select>
  );
};

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

/* 🧾 Order Details Modal */
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
              Placed on{" "}
              {new Date(order.createdAt).toLocaleString()}
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
          {/* Customer & Shipping */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-[#F7F3E9] rounded-2xl p-4">
              <h4 className="font-semibold text-[#003D33] mb-2">
                Customer
              </h4>
              <p className="text-sm text-[#003D33]">
                {user.fullName || user.name || "Unknown User"}
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
                {order.shippingAddress?.city},{" "}
                {order.shippingAddress?.state} -{" "}
                {order.shippingAddress?.pincode}
              </p>
            </div>
          </div>

          {/* Items */}
          <div>
            <h4 className="font-semibold text-[#003D33] mb-2">
              Items
            </h4>
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

          {/* Summary */}
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
                Payment: {order.paymentMethod === "razorpay" ? "Prepaid" : "COD"}{" "}
                ({order.paymentStatus || "Pending"})
              </p>
              <p className="text-xs text-[#00695C]">
                Shiprocket Status: {order.shiprocketStatus || "Pending"}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OrdersTab;
