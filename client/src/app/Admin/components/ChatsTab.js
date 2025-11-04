import { motion } from 'framer-motion';
import { FaEye, FaTrash } from 'react-icons/fa';
import { FiMessageSquare } from 'react-icons/fi';

const ChatsTab = ({ chats, searchTerm, onDeleteChat }) => {
  const filteredChats = chats.filter(chat =>
    chat.participants.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    chat.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-[#003D33]">Chat Management</h2>
          <p className="text-[#00695C]">Monitor conversations between users and astrologers</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[#00695C] bg-[#ECE5D3] px-3 py-1 rounded-full">
            {filteredChats.length} active chats
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredChats.map((chat) => (
          <motion.div
            key={chat._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            className="bg-white rounded-3xl border border-[#B2C5B2] p-6 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-[#003D33] text-lg">
                  {chat.participants.map(p => p.name).join(' & ')}
                </h3>
                <p className="text-[#00695C] text-sm">
                  Last activity: {new Date(chat.lastMessageTime).toLocaleDateString()}
                </p>
              </div>
              {chat.unread > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {chat.unread} new
                </span>
              )}
            </div>

            <div className="mb-4">
              <p className="text-[#003D33] line-clamp-2">
                {chat.lastMessage}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-blue-500 text-white px-4 py-2 rounded-2xl text-sm font-semibold hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  <FaEye />
                  View Chat
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-green-500 text-white px-4 py-2 rounded-2xl text-sm font-semibold hover:bg-green-600 transition-colors flex items-center gap-2"
                >
                  <FiMessageSquare />
                  Join
                </motion.button>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onDeleteChat(chat._id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-2xl transition-colors"
                title="Delete Chat"
              >
                <FaTrash />
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ChatsTab;