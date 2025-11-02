import { motion } from 'framer-motion';
import { FaGem, FaStar, FaLeaf, FaMoon, FaSun, FaUser, FaSignInAlt, FaHome, FaShoppingBag, FaCreditCard } from 'react-icons/fa';

const Loading = ({ size = 'default', text = 'Loading...', type = 'default' }) => {
  const sizes = {
    small: 'w-8 h-8',
    default: 'w-16 h-16',
    large: 'w-24 h-24'
  };

  const loadingVariants = {
    gem: {
      icon: FaGem,
      style: 'from-[#C06014] to-[#D47C3A]'
    },
    star: {
      icon: FaStar,
      style: 'from-[#00695C] to-[#003D33]'
    },
    moon: {
      icon: FaMoon,
      style: 'from-purple-500 to-indigo-500'
    },
    sun: {
      icon: FaSun,
      style: 'from-amber-400 to-orange-500'
    },
    user: {
      icon: FaUser,
      style: 'from-blue-500 to-cyan-500'
    },
    login: {
      icon: FaSignInAlt,
      style: 'from-green-500 to-emerald-500'
    },
    home: {
      icon: FaHome,
      style: 'from-orange-500 to-red-500'
    },
    product: {
      icon: FaShoppingBag,
      style: 'from-pink-500 to-rose-500'
    },
    card: {
      icon: FaCreditCard,
      style: 'from-teal-500 to-green-500'
    }
  };

  const { icon: Icon, style } = loadingVariants[type] || loadingVariants.gem;

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <motion.div
        className={`${sizes[size]} bg-gradient-to-br ${style} rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden`}
        animate={{
          rotate: 360,
          scale: [1, 1.1, 1]
        }}
        transition={{
          rotate: {
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          },
          scale: {
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
      >
        <motion.div
          animate={{
            rotate: -360
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <Icon className="text-white text-xl" />
        </motion.div>
        
        {/* Pulsing ring */}
        <motion.div
          className="absolute inset-0 border-2 border-white/30 rounded-2xl"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [1, 0, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-4 flex flex-col items-center gap-2"
      >
        <div className="flex space-x-1">
          <motion.div
            className="w-2 h-2 bg-[#C06014] rounded-full"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0 }}
          />
          <motion.div
            className="w-2 h-2 bg-[#00695C] rounded-full"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
          />
          <motion.div
            className="w-2 h-2 bg-[#003D33] rounded-full"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
          />
        </div>
        <span className="text-[#003D33] font-medium text-sm">{text}</span>
      </motion.div>
    </div>
  );
};

// Full Page Loaders
export const PageLoader = ({ text = "Preparing your cosmic dashboard..." }) => (
  <div className="fixed inset-0 bg-gradient-to-br from-[#F7F3E9] via-[#ECE5D3] to-[#F7F3E9] flex items-center justify-center z-50">
    <div className="text-center">
      <Loading size="large" text={text} type="gem" />
    </div>
  </div>
);

export const SignupLoader = ({ text = "Creating your cosmic account..." }) => (
  <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 flex items-center justify-center z-50">
    <div className="text-center">
      <Loading size="large" text={text} type="user" />
    </div>
  </div>
);

export const LoginLoader = ({ text = "Connecting to the cosmos..." }) => (
  <div className="fixed inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 flex items-center justify-center z-50">
    <div className="text-center">
      <Loading size="large" text={text} type="login" />
    </div>
  </div>
);

export const LandingLoader = ({ text = "Welcome to Cosmic Connections..." }) => (
  <div className="fixed inset-0 bg-gradient-to-br from-[#F7F3E9] via-[#ECE5D3] to-[#F7F3E9] flex items-center justify-center z-50">
    <div className="text-center">
      <Loading size="large" text={text} type="home" />
    </div>
  </div>
);

// In-place Loaders (for specific sections)
export const TableLoader = () => (
  <div className="p-8">
    <Loading size="default" text="Loading cosmic data..." type="star" />
  </div>
);

export const CardLoader = () => (
  <div className="p-4">
    <Loading size="small" text="Loading..." type="moon" />
  </div>
);

export const ChartLoader = () => (
  <div className="p-8 flex items-center justify-center">
    <Loading size="default" text="Drawing constellations..." type="sun" />
  </div>
);

export const ProductsPageLoader = () => (
  <div className="min-h-screen bg-gradient-to-br from-[#F7F3E9] via-[#ECE5D3] to-[#F7F3E9] flex items-center justify-center">
    <div className="text-center">
      <Loading size="large" text="Discovering spiritual products..." type="product" />
    </div>
  </div>
);

export const ProductCardLoader = () => (
  <div className="bg-white rounded-3xl border border-[#B2C5B2] p-6 shadow-lg">
    <Loading size="small" text="Loading product..." type="product" />
  </div>
);

export const PaymentLoader = () => (
  <div className="p-8 flex items-center justify-center">
    <Loading size="default" text="Processing payment..." type="card" />
  </div>
);

// Grid Loaders for multiple items
export const ProductGridLoader = ({ count = 6 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }, (_, index) => (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        <ProductCardLoader />
      </motion.div>
    ))}
  </div>
);

export const CardGridLoader = ({ count = 4 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {Array.from({ length: count }, (_, index) => (
      <motion.div
        key={index}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.1 }}
        className="bg-white rounded-3xl p-6 border border-[#B2C5B2] shadow-lg"
      >
        <Loading size="small" text="Loading..." type="moon" />
      </motion.div>
    ))}
  </div>
);

// Skeleton Loaders for more specific content
export const ProductSkeletonLoader = () => (
  <div className="bg-white rounded-3xl border border-[#B2C5B2] p-6 shadow-lg animate-pulse">
    <div className="flex flex-col space-y-4">
      <div className="w-16 h-16 bg-gradient-to-br from-[#C06014] to-[#D47C3A] rounded-2xl mx-auto"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
      </div>
      <div className="flex justify-between items-center">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
      </div>
    </div>
  </div>
);

export const TableSkeletonLoader = ({ rows = 5 }) => (
  <div className="bg-white rounded-3xl border border-[#B2C5B2] overflow-hidden shadow-lg">
    <div className="p-6 bg-gradient-to-r from-[#ECE5D3] to-[#F7F3E9] animate-pulse">
      <div className="h-6 bg-gray-300 rounded w-1/4"></div>
    </div>
    <div className="divide-y divide-[#B2C5B2]">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="p-6 animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-200 rounded-2xl"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
            <div className="h-6 bg-gray-200 rounded w-20"></div>
            <div className="h-6 bg-gray-200 rounded w-16"></div>
            <div className="h-8 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Quick inline loaders
export const InlineLoader = ({ text = "Loading..." }) => (
  <div className="flex items-center justify-center py-4">
    <Loading size="small" text={text} type="star" />
  </div>
);

export const ButtonLoader = ({ text }) => (
  <div className="flex items-center justify-center gap-2">
    <motion.div
      className="w-4 h-4 bg-current rounded-full"
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 1, repeat: Infinity }}
    />
    <span>{text}</span>
  </div>
);

export default Loading;