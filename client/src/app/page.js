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
import Navbar from './components/Navbar'
import { adminAPI } from "./lib/admin";
import { useDispatch, useSelector } from "react-redux";
import MiniAdStrip from './components/Home/MiniAdStrip'
import { productType } from "./store/features/productTypeSlice";
import axios from "axios";
import { productAPI } from "./lib/product";


const HeroSection = () => {
  const [carousel, setCarousel] = useState()
  const router = useRouter()



  

  const fetchCarousel = async () => {
    try {
     
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/api/admin/carousel/home`
      );
     
      setCarousel(res.data.carousel.slides);
    } catch (error) {
      console.error("Error fetching carousel:", error);
    } 
  };
  useEffect(() =>{
    fetchCarousel()

  },[])
  
  const astrologerpage = () =>{
    localStorage.setItem("service", "All");
    router.push("/astrologers")
  }

  

  return (
  <section className="  relative min-h-screen flex flex-col lg:flex-row items-center justify-between font-poppins pt-24 ">

      {/* Background split */}
      <div className="absolute inset-0 flex flex-col lg:flex-row">
        {/* Left Side - White background with Zodiac circle aligned bottom-left */}
        <div className="w-full lg:w-[70%] bg-white relative overflow-hidden min-h-[45vh] sm:min-h-[40vh] md:min-h-[45vh] lg:min-h-0">
          <div className="absolute left-[-100px] sm:left-[-150px] md:left-[-200px] lg:left-[-300px] bottom-0 w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] md:w-[500px] md:h-[500px] lg:w-[700px] lg:h-[700px] opacity-5">
            <Image 
              src="/bgCircle.png" 
              alt="Zodiac Left" 
              fill 
              className="object-contain object-left-bottom" 
            />
          </div>
        </div>

        {/* Right Side - Brown background with Zodiac circle aligned bottom-right */}
        <div className="w-full lg:w-1/3 bg-[#B49A77] relative overflow-hidden rounded-bl-[0px] lg:rounded-bl-[50px] rounded-br-[0px] lg:rounded-br-[50px] min-h-[45vh] sm:min-h-[40vh] md:min-h-[45vh] lg:min-h-0 max-md:bg-white">
          <div className="absolute right-[-20px] sm:right-[-25px] md:right-[-35px] lg:right-[-50px] bottom-[-25px] sm:bottom-[-30px] md:bottom-[-40px] lg:bottom-[-60px] w-[120px] h-[120px] sm:w-[150px] sm:h-[150px] md:w-[200px] md:h-[200px] lg:w-[250px] lg:h-[250px] opacity-20">
            <Image 
              src="/bgSymbol.png" 
              alt="Zodiac Right" 
              fill 
              className="object-contain object-right-bottom" 
            />
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="relative z-10 flex flex-col lg:flex-row w-full h-full">
        {/* Left Content */}
        <div className="w-full  lg:w-[50%] mx-auto flex flex-col justify-center px-4 sm:px-6 md:px-8 lg:pl-12 xl:pl-16 lg:pr-0 mt-8 sm:mt-10 md:mt-12 lg:mt-0 lg:py-20 ">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="w-full max-w-4xl mx-auto lg:mx-0 "
          >
            {/* Tagline */}
          <div className="flex justify-center lg:justify-start mb-4 sm:mb-5 md:mb-6 gap-6">
    
    {/* BUTTON 1: Personalized Consultations */}
    <motion.div
      className="relative overflow-hidden inline-block rounded-full hover:cursor-pointer"
      // 1. Pulsing Glow Animation (Piche ki chamak)
      animate={{
        boxShadow: [
          "0px 0px 0px rgba(229, 222, 206, 0)",
          "0px 0px 15px rgba(229, 222, 206, 0.8)",
          "0px 0px 0px rgba(229, 222, 206, 0)",
        ],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-[#E5DECED6] rounded-full text-[#7E5833] text-xs sm:text-sm md:text-base lg:text-lg font-medium text-center relative z-10">
        <Link href="/astrologers?service=ALL">Personalized Consultations</Link>
      </div>

      {/* 2. Moving Shine Effect (Heera jaisa chamak) */}
      <motion.div
        className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/80 to-transparent"
        style={{ skewX: -20 }} // Skew for realistic reflection
        initial={{ x: "-150%" }}
        animate={{ x: "150%" }}
        transition={{
          repeat: Infinity,
          duration: 1.5, // Adjust speed (lower is faster)
          ease: "linear",
          repeatDelay: 1, // Pause between shines
        }}
      />
    </motion.div>

    {/* BUTTON 2: Shop Astrology Products */}
    <motion.button
      className="relative overflow-hidden w-full lg:w-auto rounded-full shadow-md text-sm sm:text-base font-medium whitespace-nowrap"
      onClick={() => {
        router.push("/ProductsPage");
      }}
      // 1. Pulsing Glow Animation
      animate={{
        scale: [1, 1.02, 1], // Subtle breathing effect
        boxShadow: [
          "0px 0px 0px rgba(126, 88, 51, 0)",
          "0px 0px 20px rgba(126, 88, 51, 0.6)", // Golden glow
          "0px 0px 0px rgba(126, 88, 51, 0)",
        ],
      }}
      transition={{
        duration: 2.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {/* Background Layer */}
      <div className="absolute inset-0 bg-[#7E5833] z-0"></div>

      {/* 2. Moving Shine Effect */}
      <motion.div
        className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent z-10"
        style={{ skewX: -20 }}
        initial={{ x: "-200%" }}
        animate={{ x: "400%" }}
        transition={{
          repeat: Infinity,
          duration: 1.2,
          ease: "linear",
          repeatDelay: 0.5,
        }}
      />

      {/* Text Layer (Must be above shine) */}
      <span className="relative z-20 px-6 py-3 block text-white">
        Shop Astrology Products
      </span>
    </motion.button>
  </div>
            {/* Main Heading */}
            <div className="flex w-full items-center lg:items-start space-y-3 sm:space-y-4 mb-4 sm:mb-5 md:mb-6 ">
              <div className="flex items-center justify-center lg:justify-start sm:space-x-3 w-full relative">
         <h1
  className="
    w-full
    max-w-4xl
    mx-auto
    lg:mx-0

    text-[26px]
    sm:text-[32px]
    md:text-[40px]
    lg:text-[48px]
    xl:text-[50px]

    leading-tight
    font-normal
    text-[#000000]

    text-center
    lg:text-left
  "
>
  Discover the Power of the Stars
</h1>

                 
                {/* Star icon beside heading */}
                <Image
                  src="/star.png"
                  alt="Star Icon"
                  width={24}
                  height={24}
                  className="opacity-80 hidden sm:block sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 mt-1 absolute"
                />
              </div>
            </div>

            {/* Button and Description */}
            
             
             <p
  className="
    text-[#5C4B3A]
    text-sm
    sm:text-base
    md:text-lg
    lg:text-xl
    text-center
    lg:text-left
    max-w-4xl
    mx-auto
    lg:mx-0
    leading-relaxed
    

  "
>
  Unlock your potential with personalized astrology readings, celestial
  products, and expert consultations.
</p>

            

            {/* Service Cards */}

<div
  className="
    grid
    grid-cols-2
    sm:grid-cols-3
    md:grid-cols-4
    gap-2
    w-full
    max-w-4xl
    mx-auto
    mt-6
    
  "
>

  
    <Link  href="/Kundli-Matching">
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="
          bg-white 
          shadow-md 
          rounded-xl  
          text-center 
          cursor-pointer 
           
          -[#7E5833] 
          hover:shadow-xl 
          transition-all 
          duration-300
          overflow-hidden
          flex flex-col
           
        "
    
      >
        {/* Image Section */}
        <div className="relative w-full aspect-[3/4]">
          <Image
            src="/kundli.jpeg"
            alt="Kundli Matching"
            fill
            className="object-cover"
          />
        </div>

        {/* Title - Single Line Only */}
        <p className="
          py-2 
          text-[#7E5833] 
          text-[10px] 
          xs:text-[11px]
          sm:text-[12px] 
          md:text-sm 
          font-bold 
          whitespace-nowrap 
          overflow-hidden 
          text-ellipsis
        "
        >
         Kundli Matching
        </p>
      </motion.div>
    </Link>
     <Link href="/Horoscope">
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="
          bg-white 
          shadow-md 
          rounded-xl  
          text-center 
          cursor-pointer 
           
          -[#7E5833] 
          hover:shadow-xl 
          transition-all 
          duration-300
          overflow-hidden
          flex flex-col
           
        "
    
      >
        {/* Image Section */}
        <div className="relative w-full aspect-[3/4]">
          <Image
            src="/horoscope.jpeg"
            alt="Horoscope"
            fill
            className="object-cover"
          />
        </div>

        {/* Title - Single Line Only */}
        <p className="
          py-2 
          text-[#7E5833] 
          text-[10px] 
          xs:text-[11px]
          sm:text-[12px] 
          md:text-sm 
          font-bold 
          whitespace-nowrap 
          overflow-hidden 
          text-ellipsis
        "
        >
         Horoscope
        </p>
      </motion.div>
    </Link>
     <Link href="/ProductsPage">
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="
          bg-white 
          shadow-md 
          rounded-xl  
          text-center 
          cursor-pointer 
           
          -[#7E5833] 
          hover:shadow-xl 
          transition-all 
          duration-300
          overflow-hidden
          flex flex-col
           
        "
    
      >
        {/* Image Section */}
        <div className="relative w-full aspect-[3/4]">
          <Image
            src="/myastrovastore.jpeg"
            alt="My Astrova Store"
            fill
            className="object-cover"
          />
        </div>

        {/* Title - Single Line Only */}
        <p className="
          py-2 
          text-[#7E5833] 
          text-[10px] 
          xs:text-[11px]
          sm:text-[12px] 
          md:text-sm 
          font-bold 
          whitespace-nowrap 
          overflow-hidden 
          text-ellipsis
        "
        >
          MyAstrova Mall
        </p>
      </motion.div>
    </Link>
     <div>
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="
          bg-white 
          shadow-md 
          rounded-xl  
          text-center 
          cursor-pointer 
           
          -[#7E5833] 
          hover:shadow-xl 
          transition-all 
          duration-300
          overflow-hidden
          flex flex-col
           
        "
    
      >
        {/* Image Section */}
        <div className="relative w-full aspect-[3/4]" onClick={astrologerpage}>
          <Image
            src="/talktoastrologer.jpeg"
            alt="Talk to Astrologer"
            fill
            className="object-cover"
          />
        </div>

        {/* Title - Single Line Only */}
        <p className="
          py-2 
          text-[#7E5833] 
          text-[10px] 
          xs:text-[11px]
          sm:text-[12px] 
          md:text-sm 
          font-bold 
          whitespace-nowrap 
          overflow-hidden 
          text-ellipsis
        "
        >
          Talk To Astrologer
        </p>
      </motion.div>
    </div>
  
</div>
<div className="ad  h-[100px] pt-[40px] max-md:pt-[20px] max-sm:pt-[0px]"><MiniAdStrip slides={carousel || []}/></div>


          </motion.div>
       
        </div>
{/* Right Side - Pandit Image */}
<div className="w-full lg:w-1/2 relative flex justify-center items-center mt-16 sm:mt-8 md:mt-40 lg:mt-0 px-4 sm:px-6 md:px-8 lg:px-0 pb-8 sm:pb-10 md:pb-12 lg:pb-0">
  {/* Halo + Rings */}
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 1 }}
    className="absolute inset-0 flex justify-center items-center pointer-events-none"
  >
    {/* Glow */}
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      className="
        rounded-full bg-gradient-to-r from-yellow-400/20 to-orange-500/20 blur-xl
        w-[280px] h-[280px]
        sm:w-[350px] sm:h-[350px]
        md:w-[450px] md:h-[450px]
        lg:w-[500px] lg:h-[500px]
        xl:w-[650px] xl:h-[650px]
      "
    />

    {/* Halo Outline */}
    <motion.div
      animate={{ rotate: -360 }}
      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      className="
        absolute rounded-full border-2 border-yellow-300/25
        w-[330px] h-[330px]
        sm:w-[350px] sm:h-[350px]
        md:w-[500px] md:h-[500px]
        lg:w-[550px] lg:h-[550px]
        xl:w-[650px] xl:h-[650px]
      "
    />

    {/* Single Zodiac Ring - All signs positioned consistently */}
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      className="
        absolute rounded-full
        w-[330px] h-[330px]
        sm:w-[350px] sm:h-[350px]
        md:w-[550px] md:h-[550px]
        lg:w-[550px] lg:h-[550px]
        xl:w-[650px] xl:h-[650px]
      "
    >
      {[
        { symbol: "♈", name: "Aries" },
        { symbol: "♉", name: "Taurus" },
        { symbol: "♊", name: "Gemini" },
        { symbol: "♋", name: "Cancer" },
        { symbol: "♌", name: "Leo" },
        { symbol: "♍", name: "Virgo" },
        { symbol: "♎", name: "Libra" },
        { symbol: "♏", name: "Scorpio" },
        { symbol: "♐", name: "Sagittarius" },
        { symbol: "♑", name: "Capricorn" },
        { symbol: "♒", name: "Aquarius" },
        { symbol: "♓", name: "Pisces" }
      ].map((zodiac, index) => {
        // Calculate angle for each sign (12 signs, 30 degrees apart)
        const angle = (index * 30 * Math.PI) / 180;
        // Consistent radius for all signs
        const radius = 48; // percentage from center
        
        return (
          <motion.div
            key={zodiac.name}
            className="absolute flex items-center justify-center"
            style={{
              left: `calc(50% + ${radius * Math.cos(angle)}% - 1.5rem)`,
              top: `calc(50% + ${radius * Math.sin(angle)}% - 1.5rem)`,
              transform: 'translate(-50%, -50%)',
            }}
            animate={{
              scale: [1, 1.15, 1],
              rotate: [0, 5, 0, -5, 0],
            }}
            transition={{
              scale: {
                duration: 3,
                repeat: Infinity,
                delay: index * 0.2,
                ease: "easeInOut"
              },
              rotate: {
                duration: 4,
                repeat: Infinity,
                delay: index * 0.15,
                ease: "easeInOut"
              }
            }}
            whileHover={{
              scale: 1.3,
              transition: { duration: 0.3 }
            }}
          >
            <div className="
              w-6 h-6
              sm:w-9 sm:h-9 
              md:w-9 md:h-9
              lg:w-9 lg:h-9 
              xl:w-9 xl:h-9
              flex items-center justify-center
              bg-gradient-to-br from-yellow-400/30 via-yellow-300/20 to-orange-500/30
              rounded-full backdrop-blur-sm
              border-2 border-yellow-400/40
              shadow-lg shadow-yellow-500/30
              transition-all duration-300
              hover:shadow-xl hover:shadow-yellow-500/40
              hover:border-yellow-300/60
              group
            ">
              <span className="
                text-sm sm:text-lg md:text-xl lg:text-xl xl:text-2xl
                text-yellow-300 font-bold
                drop-shadow-[0_0_8px_rgba(255,215,0,0.6)]
                group-hover:drop-shadow-[0_0_12px_rgba(255,215,0,0.8)]
                transition-all duration-300
                
              ">
                {zodiac.symbol}
              </span>
              
              {/* Zodiac name tooltip on hover */}
              <div className="
                absolute -bottom-8 left-1/2 transform -translate-x-1/2
                px-2 py-1 bg-black/80 backdrop-blur-sm rounded-md
                border border-yellow-500/30
                text-xs sm:text-sm text-yellow-200 font-medium
                opacity-0 group-hover:opacity-100
                transition-opacity duration-300
                whitespace-nowrap
                z-50
              ">
                {zodiac.name}
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>

    {/* Decorative Outer Ring with Dots */}
    <motion.div
      animate={{ rotate: -360 }}
      transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      className="
        absolute rounded-full
        w-[330px] h-[330px]
        sm:w-[350px] sm:h-[350px]
        md:w-[550px] md:h-[550px]
        lg:w-[550px] lg:h-[550px]
        xl:w-[800px] xl:h-[800px]
      "
    >
      {[...Array(24)].map((_, i) => (
        <div
          key={`dot-${i}`}
          className="absolute w-1.5 h-1.5 sm:w-2 sm:h-2 bg-yellow-400/30 rounded-full"
          style={{
            left: `${50 + 50 * Math.cos((i * 15 * Math.PI) / 180)}%`,
            top: `${50 + 50 * Math.sin((i * 15 * Math.PI) / 180)}%`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
    </motion.div>
  </motion.div>

  {/* Pandit Image */}
  <motion.div
    initial={{ opacity: 0, y: 25 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 1 }}
    className="relative z-10"
  >
    <div className="
      relative 
      w-[240px] h-[240px] 
      sm:w-[300px] sm:h-[300px] 
      md:w-[380px] md:h-[380px] 
      lg:w-[450px] lg:h-[450px] 
      xl:w-[480px] xl:h-[580px]
    ">
      <Image
        src="/pandit.png"
        alt="Astrologer"
        fill
        className="object-contain drop-shadow-2xl"
        priority
      />
    </div>
  </motion.div>

  {/* Floating Glow Effects */}
  <div className="absolute inset-0 pointer-events-none">
    {/* Center Glow */}
    <div className="
      absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
      w-[120px] h-[120px]
      sm:w-[150px] sm:h-[150px]
      md:w-[180px] md:h-[180px]
      lg:w-[200px] lg:h-[200px]
      xl:w-[220px] xl:h-[220px]
      rounded-full bg-gradient-to-r from-yellow-500/10 to-orange-500/10 blur-2xl
    " />
  </div>
</div>
      </div>

    </section>
  );
};

export default function AstroHeroPage() {
  const [products, setProducts] = useState();
  const [productType, setProductType] = useState()
   
    const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    type: '',
    minPrice: '',
    maxPrice: '',
    isFeatured: '',
    sortBy: "price",
    order: "asc",
  });
    
  useEffect(() =>{
    console.log(process.env.NEXT_PUBLIC_API)
    const fetchProducts = async () =>{
      try{
        const {products, totalPages} = await productAPI.getProducts(filters);
        setProducts(products);
       
      }catch(err){
        console.log(err.message);
      }
    }
    fetchProducts();
  
  },[productType]);
  const handleCategoryClick = (cat) => {
    setProductType(cat);
   
    setFilters((prev) => ({
      ...prev,
      page: 1,        // Reset to first page
      limit: 10,      // Ensure 10 products per page
      type: cat === prev.type ? "" : cat, // Toggle off if clicked again
    }));
    
  };
  const fetchProducts = async () =>{
    try{
      const {products, totalPages} = await productAPI.getProducts({
    page: 1,
    limit: 10,
    search: '',
    type: '',
    minPrice: '',
    maxPrice: '',
    isFeatured: '',
    sortBy: "price",
    order: "asc",
  });
 
      setProducts(products);
    }catch(err){
      console.log(err.message);
    }
  }
 
  const productType1 = useSelector((state) => state.productType.value);
  
  return (
    <div className="relative min-h-screen overflow-hidden">
      <Navbar />
      <HeroSection />
      <About/>
      <Product />
      <BestProducts categories={productType1} products={products} handleCategoryClick={handleCategoryClick} filters={filters} setFilters={setFilters} setProductType={setProductType} fetchProducts={fetchProducts} />
      <BookConsultant/>
      <AstrologerSection/>
      <PremiumProductSection/>
      <Testimonial/>
    </div>
  );
}