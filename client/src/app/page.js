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
import { productType } from "./store/features/productTypeSlice";

const HeroSection = () => {
  const router = useRouter()
  const serviceCards = [
    {
      title: "Kundli Matching",
      img: "/kundli.png",
      link: "/"
    },
    {
      title: "Horoscope",
      img: "/horoscope.png",
      link: "/"
    },
    {
      title: "MyAstrova Mall",
      img: "/astromall.png",
      link: "/ProductsPage"
    },
    {
      title: "Talk To Astrologer",
      img: "/talktoastrologer.png",
      link: "/"
    },
  ];

  return (
  <section className="relative min-h-screen flex flex-col lg:flex-row items-center justify-between font-poppins pt-24">

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
        <div className="w-full lg:w-[50%] mx-auto flex flex-col justify-center px-4 sm:px-6 md:px-8 lg:pl-12 xl:pl-20 lg:pr-0 mt-8 sm:mt-10 md:mt-12 lg:mt-0 lg:py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="w-full max-w-2xl mx-auto lg:mx-0"
          >
            {/* Tagline */}
            <div className="flex justify-center lg:justify-start mb-4 sm:mb-5 md:mb-6">
              <p className="inline-block px-3 py-1.5 sm:px-4 sm:py-2 bg-[#E5DECED6] rounded-full text-[#7E5833] text-xs sm:text-sm md:text-base lg:text-lg font-medium text-center">
                Personalized Astrology, Products & Consultations
              </p>
            </div>

            {/* Main Heading */}
            <div className="flex flex-col items-center lg:items-start space-y-3 sm:space-y-4 mb-4 sm:mb-5 md:mb-6">
              <div className="flex items-center justify-center lg:justify-start space-x-2 sm:space-x-3">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-[50px] leading-tight sm:leading-snug md:leading-normal lg:leading-[135%] font-normal text-[#000000] text-center lg:text-left">
                  Discover the Power <br className="hidden sm:block" /> of the Stars
                </h1>
                {/* Star icon beside heading */}
                <Image
                  src="/star.png"
                  alt="Star Icon"
                  width={24}
                  height={24}
                  className="opacity-80 hidden sm:block sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 mt-1"
                />
              </div>
            </div>

            {/* Button and Description */}
            <div className="flex flex-col lg:flex-row justify-between items-center lg:items-start gap-4 sm:gap-5 md:gap-6 mb-6 sm:mb-8 md:mb-10 lg:mb-12"> 
              <button className="w-full lg:w-auto px-6 py-3 bg-[#7E5833] text-white rounded-lg shadow-md hover:bg-[#5A3E25] transition-all duration-300 text-sm sm:text-base font-medium whitespace-nowrap">
                Shop Astrology Products
              </button>
              <p className="text-[#5C4B3A] text-sm sm:text-base md:text-lg lg:text-xl text-center lg:text-left w-full lg:max-w-md leading-relaxed sm:leading-loose">
                Unlock your potential with personalized astrology readings, celestial products, and expert consultations.
              </p>
            </div>

            {/* Service Cards */}

<div className="
  grid 
  grid-cols-2 
  sm:grid-cols-3 
  md:grid-cols-4 
  gap-3 
  w-full 
  max-w-3xl 
  lg:max-w-4xl 
  mx-auto 
  mt-6
">
  {serviceCards.map((card, index) => (
    <Link key={index} href={card.link || "#"}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="
          bg-white 
          shadow-md 
          rounded-xl  
          text-center 
          cursor-pointer 
          border 
          border-[#7E5833] 
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
            src={card.img}
            alt={card.title}
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
          {card.title}
        </p>
      </motion.div>
    </Link>
  ))}
</div>


          </motion.div>
       
        </div>

        {/* Right Side - Pandit Image */}
        <div className="w-full lg:w-1/2 relative flex justify-center items-center mt-6 sm:mt-8 md:mt-10 lg:mt-0 px-4 sm:px-6 md:px-8 lg:px-0 pb-8 sm:pb-10 md:pb-12 lg:pb-0">
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
                absolute rounded-full border border-yellow-300/25
                w-[320px] h-[320px]
                sm:w-[400px] sm:h-[400px]
                md:w-[500px] md:h-[500px]
                lg:w-[550px] lg:h-[550px]
                xl:w-[700px] xl:h-[700px]
              "
            />

            {/* Sparkles */}
            <motion.div
              animate={{ rotate: 180 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="
                absolute rounded-full
                w-[360px] h-[360px]
                sm:w-[450px] sm:h-[450px]
                md:w-[550px] md:h-[550px]
                lg:w-[600px] lg:h-[600px]
                xl:w-[750px] xl:h-[750px]
              "
            >
              {[...Array(10)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1.5 h-1.5 sm:w-2 sm:h-2 bg-yellow-300 rounded-full"
                  style={{
                    left: `${50 + 46 * Math.cos((i * 36 * Math.PI) / 180)}%`,
                    top: `${50 + 46 * Math.sin((i * 36 * Math.PI) / 180)}%`,
                  }}
                  animate={{ scale: [1, 1.6, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.2 }}
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
            <div className="relative w-[280px] h-[280px] sm:w-[350px] sm:h-[350px] md:w-[450px] md:h-[450px] lg:w-[500px] lg:h-[500px] xl:w-[600px] xl:h-[600px]">
              <Image
                src="/pandit.png"
                alt="Astrologer"
                fill
                className="object-contain drop-shadow-xl"
                priority
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default function AstroHeroPage() {
  const productType = useSelector((state) => state.productType.value);
  
  return (
    <div className="relative min-h-screen overflow-hidden">
      <Navbar />
      <HeroSection />
      <About/>
      <Product />
      <BestProducts categories={productType}/>
      <BookConsultant/>
      <AstrologerSection/>
      <PremiumProductSection/>
      <Testimonial/>
    </div>
  );
}