import { motion } from 'framer-motion';
import { FaPlus, FaEye, FaEdit, FaTrash } from 'react-icons/fa';

const UsersTab = ({ users, searchTerm, onDeleteUser }) => {
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    return status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-[#003D33]">User Management</h2>
          <p className="text-[#00695C]">Manage your cosmic community members</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[#00695C] bg-[#ECE5D3] px-3 py-1 rounded-full">
            {filteredUsers.length} users
          </span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-[#C06014] to-[#D47C3A] text-white px-6 py-3 rounded-2xl font-semibold flex items-center gap-2"
          >
            <FaPlus />
            Add User
          </motion.button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-[#B2C5B2] overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-[#ECE5D3] to-[#F7F3E9]">
              <tr>
                <th className="px-6 py-4 text-left text-[#003D33] font-semibold">User</th>
                <th className="px-6 py-4 text-left text-[#003D33] font-semibold">Email</th>
                <th className="px-6 py-4 text-left text-[#003D33] font-semibold">Status</th>
                <th className="px-6 py-4 text-left text-[#003D33] font-semibold">Orders</th>
                <th className="px-6 py-4 text-left text-[#003D33] font-semibold">Last Active</th>
                <th className="px-6 py-4 text-left text-[#003D33] font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#B2C5B2]">
              {filteredUsers.map((user) => (
                <motion.tr
                  key={user._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-[#F7F3E9] transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#C06014] to-[#D47C3A] rounded-2xl flex items-center justify-center text-white font-semibold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-[#003D33]">{user.name}</p>
                        <p className="text-sm text-[#00695C]">Joined {new Date(user.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[#00695C]">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[#003D33] font-semibold">{user.orders}</span>
                  </td>
                  <td className="px-6 py-4 text-[#00695C]">{user.lastActive}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-2xl transition-colors"
                        title="View Details"
                      >
                        <FaEye />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 text-amber-500 hover:bg-amber-50 rounded-2xl transition-colors"
                        title="Edit User"
                      >
                        <FaEdit />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onDeleteUser(user._id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-2xl transition-colors"
                        title="Delete User"
                      >
                        <FaTrash />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UsersTab;