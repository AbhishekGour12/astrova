import { motion } from 'framer-motion';
import { FaPlus, FaStar, FaCheckCircle, FaTrash } from 'react-icons/fa';

const AstrologersTab = ({ astrologers, searchTerm, onApproveAstrologer, onDeleteAstrologer }) => {
  const filteredAstrologers = astrologers.filter(astrologer =>
    astrologer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    astrologer.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    const colors = {
      online: 'bg-green-100 text-green-600',
      offline: 'bg-gray-100 text-gray-600',
      busy: 'bg-amber-100 text-amber-600'
    };
    return colors[status] || 'bg-gray-100 text-gray-600';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-[#003D33]">Astrologer Management</h2>
          <p className="text-[#00695C]">Manage your divine guidance providers</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[#00695C] bg-[#ECE5D3] px-3 py-1 rounded-full">
            {filteredAstrologers.length} astrologers
          </span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-[#C06014] to-[#D47C3A] text-white px-6 py-3 rounded-2xl font-semibold flex items-center gap-2"
          >
            <FaPlus />
            Add Astrologer
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAstrologers.map((astrologer) => (
          <motion.div
            key={astrologer._id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -5 }}
            className="bg-white rounded-3xl border border-[#B2C5B2] p-6 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-[#C06014] to-[#D47C3A] rounded-2xl flex items-center justify-center text-white text-xl font-semibold">
                  {astrologer.name.charAt(0)}
                </div>
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(astrologer.status)}`} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[#003D33] text-lg">{astrologer.name}</h3>
                <p className="text-[#00695C] text-sm">{astrologer.specialty}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1 text-amber-400">
                    <FaStar className="text-sm" />
                    <span className="text-[#003D33] text-sm font-semibold">{astrologer.rating}</span>
                  </div>
                  <span className="text-[#00695C] text-sm">• {astrologer.clients} clients</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-[#00695C] text-sm">Experience:</span>
                <span className="text-[#003D33] font-semibold text-sm">{astrologer.experience}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#00695C] text-sm">Verification:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  astrologer.verified 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-amber-100 text-amber-600'
                }`}>
                  {astrologer.verified ? 'Verified' : 'Pending'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#00695C] text-sm">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(astrologer.status)}`}>
                  {astrologer.status}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              {!astrologer.verified && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onApproveAstrologer(astrologer._id)}
                  className="flex-1 bg-green-500 text-white py-2 rounded-2xl text-sm font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                >
                  <FaCheckCircle />
                  Approve
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onDeleteAstrologer(astrologer._id)}
                className={`${astrologer.verified ? 'flex-1' : 'px-4'} bg-red-500 text-white py-2 rounded-2xl text-sm font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2`}
              >
                <FaTrash />
                {astrologer.verified ? 'Delete' : ''}
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AstrologersTab;