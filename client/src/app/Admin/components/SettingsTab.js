import { motion } from 'framer-motion';
import { FaCog, FaShieldAlt, FaCheck, FaDownload, FaUpload } from 'react-icons/fa';

const SettingsTab = () => {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-[#003D33]">Settings</h2>
          <p className="text-[#00695C]">Configure your cosmic administration panel</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-3xl border border-[#B2C5B2] p-6 shadow-lg"
        >
          <h3 className="text-xl font-bold text-[#003D33] mb-4 flex items-center gap-2">
            <FaCog className="text-[#C06014]" />
            General Settings
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-[#003D33] font-semibold mb-2">Site Name</label>
              <input
                type="text"
                defaultValue="Cosmic Connections"
                className="w-full px-4 py-3 bg-[#F7F3E9] border border-[#B2C5B2] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#C06014] text-[#003D33]"
              />
            </div>
            <div>
              <label className="block text-[#003D33] font-semibold mb-2">Admin Email</label>
              <input
                type="email"
                defaultValue="admin@cosmic.com"
                className="w-full px-4 py-3 bg-[#F7F3E9] border border-[#B2C5B2] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#C06014] text-[#003D33]"
              />
            </div>
            <div>
              <label className="block text-[#003D33] font-semibold mb-2">Timezone</label>
              <select className="w-full px-4 py-3 bg-[#F7F3E9] border border-[#B2C5B2] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#C06014] text-[#003D33]">
                <option>UTC</option>
                <option>EST</option>
                <option>PST</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Security Settings */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-3xl border border-[#B2C5B2] p-6 shadow-lg"
        >
          <h3 className="text-xl font-bold text-[#003D33] mb-4 flex items-center gap-2">
            <FaShieldAlt className="text-[#C06014]" />
            Security Settings
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-[#F7F3E9] rounded-2xl">
              <div>
                <p className="font-semibold text-[#003D33]">Two-Factor Authentication</p>
                <p className="text-sm text-[#00695C]">Add an extra layer of security</p>
              </div>
              <button className="bg-gradient-to-r from-[#C06014] to-[#D47C3A] text-white px-4 py-2 rounded-2xl text-sm font-semibold">
                Enable
              </button>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#F7F3E9] rounded-2xl">
              <div>
                <p className="font-semibold text-[#003D33]">Session Timeout</p>
                <p className="text-sm text-[#00695C]">Auto-logout after 30 minutes</p>
              </div>
              <button className="bg-gray-500 text-white px-4 py-2 rounded-2xl text-sm font-semibold">
                Change
              </button>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#F7F3E9] rounded-2xl">
              <div>
                <p className="font-semibold text-[#003D33]">Login Notifications</p>
                <p className="text-sm text-[#00695C]">Get alerts for new logins</p>
              </div>
              <button className="bg-gradient-to-r from-[#C06014] to-[#D47C3A] text-white px-4 py-2 rounded-2xl text-sm font-semibold">
                Enabled
              </button>
            </div>
          </div>
        </motion.div>

        {/* Data Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-[#B2C5B2] p-6 shadow-lg"
        >
          <h3 className="text-xl font-bold text-[#003D33] mb-4">Data Management</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-[#F7F3E9] rounded-2xl">
              <div>
                <p className="font-semibold text-[#003D33]">Export Data</p>
                <p className="text-sm text-[#00695C]">Download all data as CSV</p>
              </div>
              <button className="bg-green-500 text-white px-4 py-2 rounded-2xl text-sm font-semibold flex items-center gap-2">
                <FaDownload />
                Export
              </button>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#F7F3E9] rounded-2xl">
              <div>
                <p className="font-semibold text-[#003D33]">Import Data</p>
                <p className="text-sm text-[#00695C]">Upload data from file</p>
              </div>
              <button className="bg-blue-500 text-white px-4 py-2 rounded-2xl text-sm font-semibold flex items-center gap-2">
                <FaUpload />
                Import
              </button>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#F7F3E9] rounded-2xl">
              <div>
                <p className="font-semibold text-[#003D33]">Backup Database</p>
                <p className="text-sm text-[#00695C]">Create system backup</p>
              </div>
              <button className="bg-purple-500 text-white px-4 py-2 rounded-2xl text-sm font-semibold">
                Backup
              </button>
            </div>
          </div>
        </motion.div>

        {/* System Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-[#B2C5B2] p-6 shadow-lg"
        >
          <h3 className="text-xl font-bold text-[#003D33] mb-4">System Information</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[#00695C]">Version</span>
              <span className="text-[#003D33] font-semibold">v2.1.0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#00695C]">Last Update</span>
              <span className="text-[#003D33] font-semibold">2024-01-15</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#00695C]">Database Size</span>
              <span className="text-[#003D33] font-semibold">245 MB</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#00695C]">Active Users</span>
              <span className="text-[#003D33] font-semibold">1,247</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#00695C]">Server Status</span>
              <span className="text-green-600 font-semibold">● Online</span>
            </div>
          </div>
        </motion.div>

        {/* Save Settings Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 flex justify-end"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-[#C06014] to-[#D47C3A] text-white px-8 py-4 rounded-2xl font-semibold text-lg flex items-center gap-2"
          >
            <FaCheck />
            Save All Changes
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default SettingsTab;