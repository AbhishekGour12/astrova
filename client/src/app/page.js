"use client";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { FaShoppingCart, FaUser, FaTimes, FaBars } from "react-icons/fa";
import { useEffect, useState } from "react";
import About from './components/Home/About'
import Product from './components/Home/Product'
import BestProducts from './components/Home/BestProducts'
import BookConsultant from './components/Home/BookConsultant'
import PremiumProductSection from './components/Home/PremiumProductSection'
import Testimonial from './components/Home/Testimonial'
import AstrologerSection from './components/Home/AstrologerSection'
import LandingLoader from './components/Loading'
import Link from "next/link";
import { useRouter } from "next/navigation";
const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useRouter()
 
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  

  
  return (
    <nav className="w-full flex justify-center">
      <div className="flex max-w-7xl m-auto justify-between items-center px-4 sm:px-6 lg:px-12 py-4 lg:py-6 absolute w-full z-50 text-[#725E43] font-semibold bg-transparent">
        <div className="text-[18px] sm:text-[20px] lg:text-[22px] font-bold flex items-center space-x-2" style={{fontFamily: "IBM Plex Serif"}}>
          <span className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 rounded-full">
            <Image src="/logo.png" width={100} height={100} className="w-full h-full" alt="Astrova Logo"/>
          </span>
          <span>ASTROVA</span>
        </div>
        
        {/* Desktop Menu */}
        <ul className="hidden lg:flex space-x-6 xl:space-x-10 text-[16px] lg:text-[18px] lg:mr-[50px] font-normal" style={{fontFamily: "Noto Sans"}}>
          
            <li
              
              className="cursor-pointer hover:text-[#B49A77] transition-all duration-300"
            >
             <Link href = "/">Home</Link>
            </li>
            <li
              
              className="cursor-pointer hover:text-[#B49A77] transition-all duration-300"
            >
             <Link href = "/Product">Products</Link>
            </li>
            <li
              
              className="cursor-pointer hover:text-[#B49A77] transition-all duration-300"
            >
             <Link href = "/">Services</Link>
            </li>
            <li
              
              className="cursor-pointer hover:text-[#B49A77] transition-all duration-300"
            >
             <Link href = "/">Best Astrologer</Link>
            </li>
            <li
              
              className="cursor-pointer hover:text-[#B49A77] transition-all duration-300"
            >
             <Link href = "/">Who are we</Link>
            </li>
            
          
        </ul>

        {/* Mobile Menu Button */}
        <div className="lg:hidden">
          <button 
            className="text-[#725E43]"
            onClick={toggleMobileMenu}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        
        <div className="flex items-center space-x-4 lg:space-x-6">
          <FaShoppingCart className="text-lg lg:text-xl cursor-pointer text-[#F6F3E4]" />
          <Link href = "/Login">
          <button className="px-3 py-1.5 lg:px-5 lg:py-2 bg-[#F6F3E4] text-[#725E43] rounded-lg shadow-md hover:bg-[#E8E3CF] transition-all duration-300 flex items-center space-x-2 text-sm lg:text-base">
           
            <FaUser className="text-sm lg:text-base" /> 
            <span className="hidden sm:inline">Login</span>

          </button>
          </Link>
        </div>

        {/* Mobile Sidebar Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0  bg-opacity-100 z-10 lg:hidden"
                onClick={toggleMobileMenu}
                style={{backgroundColor: "gray", opacity: "1"}}
              />
              
              {/* Sidebar */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "tween", duration: 0.3 }}
                className="fixed top-0 right-0 h-full w-64 bg-white shadow-2xl z-50 lg:hidden"
              >
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                  <div className="text-[18px] font-bold flex items-center space-x-2" style={{fontFamily: "IBM Plex Serif"}}>
                    <span className="w-7 h-7 rounded-full">
                      <Image src="/logo.png" width={100} height={100} className="w-full h-full" alt="Astrova Logo"/>
                    </span>
                    <span>ASTROVA</span>
                  </div>
                  <button 
                    onClick={toggleMobileMenu}
                    className="text-[#725E43] p-2"
                  >
                    <FaTimes className="w-5 h-5" />
                  </button>
                </div>
                
                <ul className="py-4 px-4 space-y-4" style={{fontFamily: "Noto Sans"}}>
                  {["Home", "Products", "Services", "Best Astrologer", "Who are we"].map((item, index) => (
                    <li
                      key={index}
                      className="cursor-pointer hover:text-[#B49A77] transition-all duration-300 text-[16px] py-2 border-b border-gray-100"
                      onClick={toggleMobileMenu}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
                
                <div className="absolute bottom-4 left-4 right-4" >
                  
                  <button className="w-full px-4 py-3 bg-[#7E5833] text-white rounded-lg shadow-md hover:bg-[#5A3E25] transition-all duration-300 text-base flex items-center justify-center space-x-2" onClick={() =>{console.log("hello")}}>
                    <FaUser className="text-base" /> 
                    <span>Login/Sign Up</span>
                  </button>
              
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

const HeroSection = () => {
  const serviceCards = [
    {
      title: "Kundli Matching",
      img: "/kundli.png",
    },
    {
      title: "Horoscope",
      img: "/horoscope.png",
    },
    {
      title: "Astro Mall",
      img: "astromall.png",
    },
    {
      title: "Talk To Astrologer",
      img: "talktoastrologer.png",
    },
  ];

  return (
    
    <section className="relative min-h-screen lg:h-screen overflow-hidden flex items-center justify-between font-poppins">
      {/* Background split */}
      <div className="absolute inset-0 flex flex-col lg:flex-row">
        {/* Left Side - White background with Zodiac circle aligned bottom-left */}
        <div className="w-full lg:w-[70%] bg-white relative overflow-hidden min-h-[50vh] sm:min-h-[55vh] lg:min-h-0">
          <div className="absolute left-[-150px] sm:left-[-200px] lg:left-[-300px] top-0 w-[400px] h-[400px] sm:w-[500px] sm:h-[500px] lg:w-[700px] lg:h-[700px] opacity-5">
            <Image src="/bgCircle.png" alt="Zodiac Left" fill className="object-contain object-left-bottom" />
          </div>
        </div>

        {/* Right Side - Brown background with Zodiac circle aligned bottom-right */}
        <div className="w-full lg:w-1/3 bg-[#B49A77] relative overflow-hidden rounded-bl-[0px] lg:rounded-bl-[50px] rounded-br-[0px] lg:rounded-br-[50px] min-h-[50vh] sm:min-h-[45vh] lg:min-h-0">
          <div className="absolute right-[-25px] sm:right-[-35px] lg:right-[-50px] bottom-[-30px] sm:bottom-[-40px] lg:bottom-[-60px] w-[150px] h-[150px] sm:w-[200px] sm:h-[200px] lg:w-[250px] lg:h-[250px] opacity-20">
            <Image src="/bgSymbol.png" alt="Zodiac Right" fill className="object-contain object-right-bottom" />
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="relative z-10 flex flex-col lg:flex-row w-full h-full pt-16 lg:pt-0">
        {/* Left Content */}
        <div className="w-full lg:w-[50%] mx-auto lg:ml-[0px] flex flex-col justify-center px-4 sm:px-6 lg:pl-20 lg:pr-0 lg:mt-32 mt-8 sm:mt-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <p className="inline-block px-3 py-1.5 lg:px-4 lg:py-2 bg-[#E5DECED6] rounded-full text-[#7E5833] text-[14px] sm:text-[16px] lg:text-[18px] mb-4 lg:mb-6 font-medium text-center lg:text-left w-full lg:w-auto">
              Personalized Astrology, Products & Consultations
            </p>
            <div className="flex items-center space-x-3 justify-center lg:justify-start">
              <h1
                className="text-[32px] sm:text-[40px] lg:text-[50px] leading-[120%] lg:leading-[135%] tracking-[0] font-[Helvetica Neue] font-normal text-[#000000] mb-4 text-center lg:text-left"
                style={{ lineHeight: "1.2" }}
              >
                Discover the Power <br /> of the Stars
              </h1>
              {/* Star icon beside heading */}
              <Image
                src="/star.png"
                alt="Star Icon"
                width={30}
                height={30}
                className="ml-2 lg:ml-3 mt-2 lg:mt-4 opacity-80 hidden sm:block"
              />
            </div>
            <div className="flex flex-col lg:flex-row justify-between items-center lg:items-start gap-4 lg:gap-6"> 
              <button className="w-full lg:w-fit px-6 py-3 bg-[#7E5833] text-white rounded-lg shadow-md hover:bg-[#5A3E25] transition-all duration-300 text-sm lg:text-base font-medium">
                Shop Astrology Products
              </button>
              <p className="text-[#5C4B3A] text-[16px] sm:text-[18px] lg:text-[20px] text-center lg:text-left w-full lg:w-1/2 leading-relaxed">
                Unlock your potential with personalized astrology readings, celestial products, and expert consultations.
              </p>
            </div>

            {/* Cards */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-3 sm:gap-4 lg:gap-6 mt-8 lg:mt-14">
              {serviceCards.map((card, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  className="bg-white shadow-md rounded-xl pb-2 w-[45%] sm:w-[48%] md:w-[22%] lg:w-36 text-center cursor-pointer border border-[#7E5833] hover:shadow-lg transition-all duration-300"
                >
                  <Image
                    src={card.img}
                    alt={card.title}
                    width={120}
                    height={100}
                    unoptimized
                    className="rounded-t-xl w-full object-cover h-[100px] sm:h-[120px] md:h-[140px] lg:h-[160px]"
                  />
                  <p className="mt-2 text-[#7E5833] text-[12px] sm:text-sm font-bold px-1" style={{fontFamily: "Helvetica Neue"}}>
                    {card.title}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Side */}
        <div className="w-full lg:w-[50%] lg:ml-[50px]  relative flex justify-center items-center mt-8 sm:mt-12 lg:mt-0 px-4 sm:px-6 lg:px-0 pb-8 lg:pb-0">
          {/* Halo Effect */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="absolute z-0"
          >
            {/* Outer Glow */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-[250px] h-[250px] sm:w-[350px] sm:h-[350px] md:w-[450px] md:h-[450px] lg:w-[600px] lg:h-[600px] rounded-full bg-gradient-to-r from-yellow-400/20 to-orange-500/20 blur-lg lg:blur-xl"
            />
            
            {/* Inner Halo Ring */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] sm:w-[300px] sm:h-[300px] md:w-[400px] md:h-[400px] lg:w-[500px] lg:h-[500px] rounded-full border border-yellow-300/30"
            />
            
            {/* Sparkle Particles */}
            <motion.div
              animate={{ rotate: 180 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[230px] h-[230px] sm:w-[330px] sm:h-[330px] md:w-[430px] md:h-[430px] lg:w-[550px] lg:h-[550px] rounded-full"
            >
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1.5 h-1.5 lg:w-2 lg:h-2 bg-yellow-300 rounded-full"
                  style={{
                    left: `${50 + 45 * Math.cos((i * 45 * Math.PI) / 180)}%`,
                    top: `${50 + 45 * Math.sin((i * 45 * Math.PI) / 180)}%`,
                  }}
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                />
              ))}
            </motion.div>
          </motion.div>

          {/* Pandit Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            className="relative z-10"
          >
            <Image
              src="/pandit.png"
              alt="Astrologer"
              width={300}
              height={300}
              className="w-[200px] h-[200px] sm:w-[280px] sm:h-[280px] md:w-[380px] md:h-[380px] lg:w-[550px] lg:h-[550px] object-contain drop-shadow-xl"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default function AstroHeroPage() {
   
  return (
    <div className="relative min-h-screen overflow-hidden">
      <Navbar />
      <HeroSection />
      <About/>
      <Product/>
      <BestProducts/>
      <BookConsultant/>
      <AstrologerSection/>
      <PremiumProductSection/>
      <Testimonial/>
    </div>
  );
}