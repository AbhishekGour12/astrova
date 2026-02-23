"use client";
import { useState, useMemo, useEffect } from "react";
import {useRouter} from "next/navigation";
import Image  from "next/image";
import MiniAdStrip from './MiniAdStrip'
import axios from "axios";
import { motion } from "framer-motion";
import Link from "next/link";
const HeroSection = () => {
  const [carousel, setCarousel] = useState()
  const router = useRouter()



  

 useEffect(() => {
    let isMounted = true;
    const fetchCarousel = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API}/api/admin/carousel/home`);
        if (isMounted ) {
            const slides = res?.data?.carousel?.slides || [];
        setCarousel(slides);
        }
      } catch (error) {
        console.error("Error fetching carousel:", error.message);
        setCarousel([])
      }
    };
    fetchCarousel();
    return () => { isMounted = false; };
  }, []);
  
  const astrologerpage = () =>{
    localStorage.setItem("service", "All");
    router.push("/astrologers")
  }

  const zodiacSigns = useMemo(() =>[
  {
    name: "Aries",
    svg: (
      <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M7 20V10c0-3 2-5 5-5s5 2 5 5v10" />
        <path d="M7 12c-2 0-3-2-3-4 0-3 2-5 5-5" />
        <path d="M17 12c2 0 3-2 3-4 0-3-2-5-5-5" />
      </svg>
    ),
  },
  {
    name: "Taurus",
    svg: (
      <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="14" r="6" />
        <path d="M8 6c0 2 2 4 4 4s4-2 4-4" />
        <path d="M6 7c0 2 1 4 3 5" />
        <path d="M18 7c0 2-1 4-3 5" />
      </svg>
    ),
  },
  {
    name: "Gemini",
    svg: (
      <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M8 4h8" />
        <path d="M8 20h8" />
        <path d="M9 4v16" />
        <path d="M15 4v16" />
      </svg>
    ),
  },
  {
    name: "Cancer",
    svg: (
      <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="9" cy="10" r="3" />
        <circle cx="15" cy="14" r="3" />
        <path d="M6 10c0-3 2-5 5-5" />
        <path d="M18 14c0 3-2 5-5 5" />
      </svg>
    ),
  },
  {
    name: "Leo",
    svg: (
      <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M8 18c0-4 6-4 6 0v2" />
        <path d="M14 12c2-1 4 0 4 2s-2 3-3 2" />
        <circle cx="9" cy="9" r="3" />
      </svg>
    ),
  },
  {
    name: "Virgo",
    svg: (
      <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 4v16" />
        <path d="M10 4v16" />
        <path d="M14 4v10c0 3 2 4 4 4" />
        <path d="M18 18c-2 0-4-1-4-4" />
      </svg>
    ),
  },
  {
    name: "Libra",
    svg: (
      <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 18h12" />
        <path d="M7 18c2-3 8-3 10 0" />
        <path d="M8 10h8" />
        <path d="M9 10a3 3 0 0 1 6 0" />
      </svg>
    ),
  },
  {
    name: "Scorpio",
    svg: (
      <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 4v16" />
        <path d="M10 4v16" />
        <path d="M14 4v14c0 2 2 2 4 0" />
        <path d="M18 18l2 2" />
        <path d="M20 20v-3" />
      </svg>
    ),
  },
  {
    name: "Sagittarius",
    svg: (
      <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 18L18 6" />
        <path d="M12 6h6v6" />
        <path d="M8 8l8 8" />
      </svg>
    ),
  },
  {
    name: "Capricorn",
    svg: (
      <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 4v14c0 2 2 2 4 0V6" />
        <path d="M10 6c0-2 2-2 4 0v12" />
        <circle cx="16" cy="18" r="2" />
      </svg>
    ),
  },
  {
    name: "Aquarius",
    svg: (
      <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 9c2 2 4 2 6 0s4-2 6 0" />
        <path d="M6 15c2 2 4 2 6 0s4-2 6 0" />
      </svg>
    ),
  },
  {
    name: "Pisces",
    svg: (
      <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M8 4c3 2 3 14 0 16" />
        <path d="M16 4c-3 2-3 14 0 16" />
        <path d="M6 12h12" />
      </svg>
    ),
  },
], []);


  return (
  <section className="  relative min-h-screen flex flex-col lg:flex-row items-center justify-between font-poppins pt-24 overflow-hidden ">

      {/* Background split */}
      <div className="absolute inset-0 flex flex-col lg:flex-row -z-10">
        {/* Left Side - White background with Zodiac circle aligned bottom-left */}
        <div className="w-full lg:w-[70%] bg-white relative overflow-hidden min-h-[45vh] sm:min-h-[40vh] md:min-h-[45vh] lg:min-h-0">
         <div className="absolute left-[-100px] sm:left-[-150px] md:left-[-200px] lg:left-[-300px] 
bottom-0 
w-[300px] h-[300px] 
sm:w-[400px] sm:h-[400px] 
md:w-[500px] md:h-[500px] 
lg:w-[700px] lg:h-[700px] 
opacity-5 relative">

  // HeroSection component ke andar
<Image 
  src="/bgCircle.png" 
  alt="Zodiac Left" 
  width={700}
  height={500} // Use actual image dimensions
  priority={true}
  fetchPriority="high"
  loading="eager"
  sizes="(max-width: 1024px) 300px, 700px"
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
              width={250}   // Ye properties required hain
  height={250}
              style={{height: 'auto'}}
            
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
  
<motion.button
  className="relative  overflow-hidden inline-block rounded-full shadow-md text-sm sm:text-base font-medium"
  onClick={() => router.push("/astrologers?service=ALL")}
  animate={{
    scale: [1, 1.02, 1],
    boxShadow: [
      "0px 0px 0px rgba(126, 88, 51, 0)",
      "0px 0px 20px rgba(126, 88, 51, 0.6)",
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

  {/* Moving Shine Effect */}
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

  {/* Text Layer */}
  <span className="relative z-20 p-4 max-sm:p-3 block text-white max-sm:text-xs w-full">
    Personalized Consultations
  </span>
</motion.button>


   
   
   
   
    {/* BUTTON 2: Shop Astrology Products */}
    <motion.button
      className="relative overflow-hidden w-full lg:w-auto rounded-full shadow-md text-sm sm:text-base font-medium"
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
      <span className="relative w-full z-20 p-3 max-sm:p-2 flex justify-center items-center text-white flex-wrap">
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
                  className="opacity-80 hidden sm:block h-auto sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 mt-1 absolute"
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
            sizes="(max-width: 768px) 100vw, 25vw"
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
            sizes="(max-width: 768px) 100vw, 50vw"
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
            src="/myastrovastore.jpg"
            alt="My Astrova Store"
            fill
            
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
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
            sizes="(max-width: 768px) 100vw, 50vw"
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
<div className={`ad ${carousel?'flex':'hidden'}  h-[100px] pt-[40px] max-md:pt-[20px] max-sm:pt-[0px]`}><MiniAdStrip slides={carousel || []}/></div>


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
        absolute rounded-full  border-yellow-300/25
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
        sm:w-[450px] sm:h-[450px]
        md:w-[550px] md:h-[550px]
        lg:w-[550px] lg:h-[550px]
        xl:w-[650px] xl:h-[650px]
      "
    >
   {zodiacSigns.map((zodiac, index) => {
  const angle = (index * 30 * Math.PI) / 180;
  const radius = 48;

  const x = (radius * Math.cos(angle)).toFixed(2);
  const y = (radius * Math.sin(angle)).toFixed(2);

  return (
    <motion.div 
      key={index}
      className="absolute flex items-center justify-center"
      style={{
        left: `calc(50% + ${x}% - 1.5rem)`,
        top: `calc(50% + ${y}% - 1.5rem)`,
        transform: "translate(-50%, -50%)",
      }}
      animate={{
        scale: [1, 1.15, 1],
        rotate: [0, 5, 0, -5, 0],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        delay: index * 0.2,
      }}
    >
      <span className="text-yellow-300">
        {zodiac.svg}
      </span>
    </motion.div>
  );
})}
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
        src="/panditbg.png"
        alt="Astrologer"
        fill
        className="object-contain drop-shadow-2xl"
        priority
        sizes="(max-width: 1280px) 100vw, 1280px"
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

export default HeroSection