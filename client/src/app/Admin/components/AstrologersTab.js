import { motion } from "framer-motion";
import { FaPlus, FaStar, FaCheckCircle, FaTrash } from "react-icons/fa";

const AstrologersTab = ({
  astrologers,
  searchTerm,
  onApproveAstrologer,
  onDeleteAstrologer,
}) => {
  const filteredAstrologers = astrologers.filter(
    (ast) =>
      ast.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ast.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    const colors = {
      online: "bg-green-100 text-green-600",
      offline: "bg-gray-100 text-gray-600",
      busy: "bg-amber-100 text-amber-600",
    };
    return colors[status] || "bg-gray-100 text-gray-600";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#003D33]">
            Astrologer Management
          </h2>
          <p className="text-sm sm:text-base text-[#00695C]">
            Manage your divine guidance providers
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm sm:text-base text-[#00695C] bg-[#ECE5D3] px-4 py-1 rounded-full">
            {filteredAstrologers.length} astrologers
          </span>

          <motion.button
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-r from-[#C06014] to-[#D47C3A] text-white px-5 py-3 rounded-2xl text-sm sm:text-base font-semibold flex items-center gap-2"
          >
            <FaPlus /> Add Astrologer
          </motion.button>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredAstrologers.map((ast) => (
          <motion.div
            key={ast._id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -5 }}
            className="bg-white rounded-3xl border border-[#B2C5B2] p-5 sm:p-6 shadow-lg hover:shadow-xl transition-all"
          >
            {/* Avatar Section */}
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-[#C06014] to-[#D47C3A] rounded-2xl flex items-center justify-center text-white text-xl font-bold">
                  {ast.name.charAt(0)}
                </div>
                <div
                  className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(
                    ast.status
                  )}`}
                />
              </div>

              <div className="flex-1">
                <h3 className="font-bold text-[#003D33] text-base sm:text-lg">
                  {ast.name}
                </h3>
                <p className="text-xs sm:text-sm text-[#00695C]">
                  {ast.specialty}
                </p>
                <div className="flex items-center gap-2 mt-1 text-xs sm:text-sm">
                  <div className="flex items-center gap-1 text-amber-400">
                    <FaStar className="text-sm" />
                    <span className="text-[#003D33] font-semibold">
                      {ast.rating}
                    </span>
                  </div>
                  <span className="text-[#00695C]">
                    • {ast.clients}+ clients
                  </span>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-2 mb-4 text-xs sm:text-sm">
              <InfoRow title="Experience" value={ast.experience} />
              <InfoRow
                title="Verification"
                value={ast.verified ? "Verified" : "Pending"}
                bg={ast.verified ? "bg-green-100 text-green-600" : "bg-amber-100 text-amber-600"}
              />
              <InfoRow
                title="Status"
                value={ast.status}
                bg={getStatusColor(ast.status)}
              />
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-2">
              {!ast.verified && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="flex-1 bg-green-500 text-white py-2 rounded-2xl text-sm font-semibold flex items-center justify-center gap-1"
                  onClick={() => onApproveAstrologer(ast._id)}
                >
                  <FaCheckCircle /> Approve
                </motion.button>
              )}

              <motion.button
                whileHover={{ scale: 1.05 }}
                className="flex-1 bg-red-500 text-white py-2 rounded-2xl text-sm font-semibold flex items-center justify-center gap-1"
                onClick={() => onDeleteAstrologer(ast._id)}
              >
                <FaTrash /> Delete
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const InfoRow = ({ title, value, bg }) => (
  <div className="flex justify-between text-[#003D33]">
    <span className="text-[#00695C]">{title}:</span>
    <span className={`px-2 py-1 rounded-md font-semibold ${bg}`}>{value}</span>
  </div>
);

export default AstrologersTab
