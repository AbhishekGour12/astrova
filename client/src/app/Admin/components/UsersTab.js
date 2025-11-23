import { motion } from "framer-motion";
import { FaPlus, FaEye, FaEdit, FaTrash } from "react-icons/fa";

const UsersTab = ({ users, searchTerm, onDeleteUser }) => {
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) =>
    status === "active"
      ? "bg-green-100 text-green-700"
      : "bg-gray-100 text-gray-700";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#003D33]">
            User Management
          </h2>
          <p className="text-[#00695C] text-sm sm:text-base">
            Manage your cosmic community members
          </p>
        </div>

        <div className="flex gap-3 items-center">
          <span className="text-sm sm:text-base text-[#00695C] bg-[#ECE5D3] px-3 py-1 rounded-full">
            {filteredUsers.length} users
          </span>

          <motion.button
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 px-4 py-2 text-sm sm:text-base
              bg-gradient-to-r from-[#C06014] to-[#D47C3A] text-white rounded-xl"
          >
            <FaPlus /> Add User
          </motion.button>
        </div>
      </div>

      {/* Table on large screens — Cards on mobile */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F7F3E9] text-[#003D33]">
              <tr>
                {["User", "Email", "Status", "Orders", "Last Active", "Actions"].map((head) => (
                  <th key={head} className="px-6 py-4 text-left font-semibold text-sm">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y">
              {filteredUsers.map((user) => (
                <motion.tr
                  key={user._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-[#F7F3E9]"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#C06014] to-[#D47C3A] rounded-xl flex items-center justify-center text-white font-semibold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-[#003D33]">{user.name}</p>
                        <p className="text-xs text-[#00695C]">
                          Joined {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-[#003D33]">{user.email}</td>

                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 font-semibold">{user.orders}</td>

                  <td className="px-6 py-4 text-sm text-[#00695C]">{user.lastActive}</td>

                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <ActionBtn icon={<FaEye />} color="text-blue-500" bg="hover:bg-blue-50" title="View" />
                      <ActionBtn icon={<FaEdit />} color="text-amber-500" bg="hover:bg-amber-50" title="Edit" />
                      <ActionBtn
                        icon={<FaTrash />}
                        color="text-red-500"
                        bg="hover:bg-red-50"
                        title="Delete"
                        onClick={() => onDeleteUser(user._id)}
                      />
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden p-4 space-y-4">
          {filteredUsers.map((user) => (
            <motion.div
              key={user._id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 bg-[#F7F3E9] rounded-xl shadow-sm space-y-2"
            >
              <div className="flex gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#C06014] to-[#D47C3A] rounded-xl flex items-center justify-center text-white font-semibold">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-[#003D33]">{user.name}</p>
                  <p className="text-xs text-[#00695C]">{user.email}</p>
                </div>
              </div>

              <div className="flex justify-between text-sm text-[#003D33]">
                <span>Status:</span>
                <span className={`px-2 py-1 rounded-full ${getStatusColor(user.status)}`}>
                  {user.status}
                </span>
              </div>

              <div className="flex justify-between text-sm text-[#003D33]">
                <span>Orders:</span> <span>{user.orders}</span>
              </div>

              <div className="text-xs text-[#00695C]">Last active: {user.lastActive}</div>

              <div className="flex gap-3 pt-2 justify-end">
                <ActionBtn icon={<FaEye />} color="text-blue-500" bg="hover:bg-blue-50" />
                <ActionBtn icon={<FaEdit />} color="text-amber-500" bg="hover:bg-amber-50" />
                <ActionBtn
                  icon={<FaTrash />}
                  color="text-red-500"
                  bg="hover:bg-red-50"
                  onClick={() => onDeleteUser(user._id)}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Action Button component
const ActionBtn = ({ icon, color, bg, title, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    title={title}
    onClick={onClick}
    className={`p-2 rounded-xl transition ${color} ${bg}`}
  >
    {icon}
  </motion.button>
);

export default UsersTab;
