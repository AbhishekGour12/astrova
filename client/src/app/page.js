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


<Navbar/>

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
    
    <section className="relative min-h-screen lg:h-screen overflow-hidden flex   items-center justify-between font-poppins ">
      {/* Background split */}
      <div className="absolute inset-0 flex flex-col lg:flex-row">
        {/* Left Side - White background with Zodiac circle aligned bottom-left */}
        <div className="w-full lg:w-[70%] bg-white relative overflow-hidden min-h-[50vh] sm:min-h-[55vh] lg:min-h-0">
          <div className="absolute left-[-150px] sm:left-[-200px] lg:left-[-300px] top-0 w-[400px] h-[400px] sm:w-[500px] sm:h-[500px] lg:w-[700px] lg:h-[700px] opacity-5">
            <Image src="/bgCircle.png" alt="Zodiac Left" fill className="object-contain object-left-bottom" />
          </div>
        </div>

        {/* Right Side - Brown background with Zodiac circle aligned bottom-right */}
        <div className="w-full lg:w-1/3 bg-[#B49A77] relative overflow-hidden rounded-bl-[0px] lg:rounded-bl-[50px] rounded-br-[0px] lg:rounded-br-[50px] min-h-[50vh] sm:min-h-[45vh] lg:min-h-0 max-md:bg-white">
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
   
<div className="w-full lg:w-1/2 relative flex justify-center items-center mt-10 lg:mt-0 px-4 pb-10 mb-6">
  
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
      w-[500px] h-[500px]
      md:w-[520px] md:h-[520px]
      lg:w-[650px] lg:h-[650px]
      "
    />

    {/* Halo Outline */}
    <motion.div
      animate={{ rotate: -360 }}
      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      className="
      absolute rounded-full border border-yellow-300/25
      w-[550px] h-[550px]
      md:w-[580px] md:h-[580px]
      lg:w-[700px] lg:h-[700px]
      "
    />

    {/* Sparkles */}
    <motion.div
      animate={{ rotate: 180 }}
      transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      className="
      absolute rounded-full
      w-[600px] h-[600px]
      md:w-[650px] md:h-[650px]
      lg:w-[750px] lg:h-[750px]
      "
    >
      {[...Array(10)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-yellow-300 rounded-full"
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

  {/* Pandit */}
  <motion.div
    initial={{ opacity: 0, y: 25 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 1 }}
    className="relative z-10"
  >
    <Image
      src="/pandit.png"
      alt="Astrologer"
      width={450}
      height={450}
      className="
        object-contain drop-shadow-xl
        w-[450px] h-[450px]
        md:w-[450px] md:h-[450px]
        lg:w-[600px] lg:h-[600px]
      "
    />
  </motion.div>

</div>


      </div>
    </section>
  );
};

export default function AstroHeroPage() {
const productType = useSelector((state) => state.productType.value);
console.log(productType)

   
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