import { motion } from "framer-motion";
import { FaEye, FaTrash, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
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
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setUsers(response.data);
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const filteredUsers = users.filter((user) => {
    const name = user.astroProfile?.fullName || user.shippingAddress?.username || "Guest";
    return name.toLowerCase().includes(searchTerm.toLowerCase()) || user.phone?.includes(searchTerm);
  });

  // Reusable Status Badge Component
  const StatusBadge = ({ isComplete, label }) => (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
      isComplete ? "bg-green-100 text-green-700" : "bg-red-50 text-red-400"
    }`}>
      {isComplete ? <FaCheckCircle /> : <FaTimesCircle />}
      {label}: {isComplete ? "True" : "False"}
    </div>
  );

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#C06014]"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#003D33]">User Directory</h2>
          <p className="text-[#00695C] text-sm">Managing {filteredUsers.length} community members</p>
        </div>
        <input
          type="text"
          placeholder="Search name or phone..."
          className="px-4 py-2 border rounded-xl focus:ring-2 focus:ring-[#C06014] outline-none w-full sm:w-64"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#F7F3E9] text-[#003D33] text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">User Information</th>
                <th className="px-6 py-4">Phone Number</th>
                <th className="px-6 py-4 text-center">Astro Profile</th>
                <th className="px-6 py-4 text-center">Shipping Address</th>
               
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredUsers.map((user) => {
                const displayName = user.astroProfile?.fullName || user.shippingAddress?.username || "Guest User";
                const isShippingComplete = !!user.shippingAddress?.addressline1;
                
                return (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                    {/* User Name & Conditional Email */}
                    <td className="px-6 py-4">
                      <p className="font-bold text-[#003D33]">{displayName}</p>
                      {isShippingComplete && user.shippingAddress?.email ? (
                        <p className="text-xs text-[#00695C] font-medium">{user.shippingAddress.email}</p>
                      ) : (
                        <p className="text-[10px] text-gray-400 italic">Email hidden (Address incomplete)</p>
                      )}
                    </td>
                    
                    {/* Phone Number */}
                    <td className="px-6 py-4 text-sm font-semibold text-[#003D33]">
                      {user.phone}
                    </td>

                    {/* Astro Profile Status */}
                    <td className="px-6 py-4 text-center">
                      <StatusBadge 
                        isComplete={user.isProfileComplete} 
                        label="Astro" 
                      />
                    </td>

                    {/* Shipping Address Status */}
                    <td className="px-6 py-4 text-center">
                      <StatusBadge 
                        isComplete={isShippingComplete} 
                        label="Shipping" 
                      />
                    </td>

                  
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UsersTab;