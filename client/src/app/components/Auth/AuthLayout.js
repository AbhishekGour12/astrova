import { motion } from 'framer-motion';
import { sacredEarthTheme } from '../../theme';

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Visual Panel */}
      <motion.div 
        className="hidden lg:flex lg:flex-1 relative overflow-hidden"
        style={{
          background: sacredEarthTheme.colors.gradient




        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="absolute inset-0 bg-black/5"></div>
        
        {/* Sacred Geometry Illustration */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div 
            className="relative"
            animate={{ rotate: 360 }}
            transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
          >
            {/* Flower of Life Pattern */}
            <div className="w-96 h-96 relative">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute border-2 rounded-full"
                  style={{
                    borderColor: sacredEarthTheme.colors.accent,
                    width: `${100 - i * 15}%`,
                    height: `${100 - i * 15}%`,
                    left: `${i * 7.5}%`,
                    top: `${i * 7.5}%`,
                  }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.2 }}
                />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Zodiac Elements */}
        <div className="absolute inset-0">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-xl"
              style={{
                color: sacredEarthTheme.colors.accent,
                left: `${20 + (i * 10)}%`,
                top: `${15 + (i * 3)}%`,
              }}
              animate={{ 
                y: [0, -10, 0],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{ 
                duration: 4,
                delay: i * 0.5,
                repeat: Infinity 
              }}
            >
              {['🌿', '🪨', '🌊', '🔥', '🌙', '☀️', '⭐', '🌎'][i]}
            </motion.div>
          ))}
        </div>

        {/* Logo and Tagline */}
        <div className="absolute top-8 left-8 z-10">
          <motion.h1 
            className="text-2xl font-bold"
            style={{ 
              color: sacredEarthTheme.colors.text,
              fontFamily: 'Cagliostro, serif'
            }}
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            AstroPath
          </motion.h1>
          <motion.p 
            className="text-sm mt-1"
            style={{ 
              color: sacredEarthTheme.colors.textSecondary,
              fontFamily: 'Lora, serif'
            }}
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            Your Cosmic Companion
          </motion.p>
        </div>

        {/* Thematic Quote */}
        <motion.div 
          className="absolute bottom-8 left-8 right-8 z-10 text-center"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <p className="text-lg italic" style={{ 
            color: sacredEarthTheme.colors.text,
            fontFamily: 'Lora, serif'
          }}>
            "As above, so below. As within, so without."
          </p>
          <p className="text-sm mt-2" style={{ 
            color: sacredEarthTheme.colors.textSecondary,
            fontFamily: 'Lora, serif'
          }}>
            - Hermetic Principle
          </p>
        </motion.div>
      </motion.div>

      {/* Right Side - Form Panel */}
      <div 
        className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20"
        style={{ backgroundColor: sacredEarthTheme.colors.bg }}
      >
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mx-auto w-full max-w-md"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
};

export default AuthLayout;