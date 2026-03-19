import { motion } from "framer-motion";
import { FaPlus, FaEye, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const UsersTab = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API}/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const StatusBadge = ({ condition }) => (
    condition ? 
    <span className="flex items-center gap-1 text-green-600 font-medium text-xs bg-green-50 px-2 py-1 rounded-lg">
      <FaCheckCircle /> True
    </span> : 
    <span className="flex items-center gap-1 text-red-400 font-medium text-xs bg-red-50 px-2 py-1 rounded-lg">
      <FaTimesCircle /> False
    </span>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C06014]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#003D33]">User Management</h2>
          <p className="text-[#00695C] text-sm">Review cosmic community profiles and completion status</p>
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border rounded-xl focus:ring-2 focus:ring-[#C06014] outline-none"
          />
          <div className="bg-[#ECE5D3] px-4 py-2 rounded-xl flex items-center font-bold text-[#003D33]">
            {filteredUsers.length}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#F7F3E9] text-[#003D33]">
              <tr>
                <th className="px-6 py-4 font-semibold text-sm">User Details</th>
                <th className="px-6 py-4 font-semibold text-sm">Contact</th>
                <th className="px-6 py-4 font-semibold text-sm text-center">Profile Done?</th>
                <th className="px-6 py-4 font-semibold text-sm text-center">Shipping</th>
                <th className="px-6 py-4 font-semibold text-sm text-center">Astro Profile</th>
               
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                  {/* Name & ID */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#C06014] rounded-full flex items-center justify-center text-white font-bold">
                        {user.username?.charAt(0) || "U"}
                      </div>
                      <div>
                        <p className="font-bold text-[#003D33]">{user.username || "Guest User"}</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-tighter">ID: {user._id.slice(-8)}</p>
                      </div>
                    </div>
                  </td>

                  {/* Phone & Email */}
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-[#003D33]">{user.phone}</p>
                    <p className="text-xs text-[#00695C]">{user.isProfileComplete ? user.email : "Email not provided"}</p>
                  </td>

                  {/* Profile Complete Status */}
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                        <StatusBadge condition={user.isProfileComplete} />
                    </div>
                  </td>

                  {/* Shipping Address Status */}
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                        <StatusBadge condition={!!user.shippingAddress} />
                    </div>
                  </td>

                  {/* Astrology Profile Status */}
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                        <StatusBadge condition={!!user.astrologyProfile} />
                    </div>
                  </td>

                  
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ActionBtn = ({ icon, color, bg, onClick }) => (
  <button onClick={onClick} className={`p-2 rounded-lg transition-all ${color} ${bg}`}>
    {icon}
  </button>
);

export default UsersTab;