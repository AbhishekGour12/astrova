"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {productAPI} from "../../lib/product"
import { useRouter } from "next/navigation";
import { adminAPI } from "../../lib/admin";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css/pagination";

export default function BestProducts({categories}) {
  
  const router = useRouter()
  
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
  console.log(process.env.NEXT_PUBLIC_IMAGE_URL)
  const fetchProducts = async () =>{
    try{
      const {products, totalPages} = await productAPI.getProducts(filters);
      setProducts(products);
      console.log(products)
    }catch(err){
      console.log(err.message);
    }
  }
  fetchProducts();

},[productType]);
const handleCategoryClick = (cat) => {
  setProductType(cat);
  console.log(cat)
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
console.log(products)
    setProducts(products);
  }catch(err){
    console.log(err.message);
  }
}




  return (
    <section className="relative py-12 sm:py-16 lg:py-20 xl:py-24 overflow-hidden">
      {/* Chakra background on top-right - Responsive sizing */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ duration: 1.5 }}
        className="absolute top-[5px] right-[5px] sm:top-[10px] sm:right-[10px] w-[60px] h-[60px] sm:w-[80px] sm:h-[80px] md:w-[100px] md:h-[100px] z-0"
      >
        <Image src="/productcakra.png" alt="chakra" fill className="object-contain" />
      </motion.div>

      {/* Section Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8 sm:mb-10">
          <p className="inline-block px-4 py-1.5 sm:px-5 sm:py-2 bg-[#E5DECED6] rounded-full text-[#7E5833] font-medium text-xs sm:text-sm mb-3 sm:mb-4">
            Products
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] xl:text-[48px] font-[Helvetica Neue] font-semibold text-[#000000] leading-tight">
            Our Best Products
          </h2>
        </div>

        {/* Category Filter Bar - Improved responsiveness */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 mb-8 sm:mb-10 lg:mb-12 px-2">
         <button
          
              className={`px-3 py-1.5 sm:px-4 sm:py-2 md:px-5 text-xs sm:text-sm rounded-full border 
  border-[#B49A77] transition-all duration-300 whitespace-nowrap
  ${
    productType === "" 
      ? "bg-[#7E5833] text-[#F6F3E4]"
      : "bg-transparent text-[#7E5833] hover:bg-[#B49A77] hover:text-[#F6F3E4]"
  }
`}
onClick={() => {
  setProductType("");
  fetchProducts();
}}

            >
              All
            </button>
          {categories?categories.map((cat, index) => (
          
          <button
              key={index}
             className={`px-3 py-1.5 sm:px-4 sm:py-2 md:px-5
text-xs sm:text-sm rounded-full border border-[#B49A77]
transition-all duration-300 whitespace-nowrap
${
  productType === cat
    ? "bg-[#7E5833] text-[#F6F3E4]"
    : "bg-transparent text-[#7E5833] hover:bg-[#B49A77] hover:text-[#F6F3E4]"
}`}

              onClick={() => handleCategoryClick(cat)}
            >
              {cat}
            </button>
          )):''}
        </div>

      {/* ===== MOBILE + TABLET SWIPER (hidden on lg+) ===== */}
      <div className="block lg:hidden px-2 sm:px-0">
        <Swiper
        modules={[Autoplay, Pagination]}
         pagination={{ clickable: true }}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          
          spaceBetween={15}
          loop={true}
          breakpoints={{
            0: { slidesPerView: 1.2 },   // Mobile
            480: { slidesPerView: 1.4 },
            640: { slidesPerView: 2 },    // sm
            768: { slidesPerView: 2.5 },  // md
            900: { slidesPerView: 3 },    // big tablets
          }}
         
        >
          {products?.map((product, index) => (
            <SwiperSlide key={index}>
              <motion.div
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col p-2 hover:cursor-pointer pb-3"
                onClick={() => router.push(`/Product/${product._id}`)}
              >
                {/* Image height optimized for mobile */}
                 
            <div className="h-[200px] xs:h-[160px] sm:h-[180px] md:h-[200px] lg:h-[220px] relative">
              <img
                src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${product.imageUrls[0]}`}
                alt={product.name}
                className="object-cover rounded-lg sm:rounded-xl w-full h-full border"
              />
            </div>

            <div className="p-3 sm:p-4 md:p-5 lg:p-6 flex flex-col flex-grow justify-between">
              <div>
                <h3 className="text-xs sm:text-sm md:text-[15px] font-semibold text-[#4A3A28] mb-2 text-center">
                  {product.name}
                </h3>

                <p className="text-[#7E5833] font-semibold text-xs sm:text-sm md:text-[15px] text-center">
                  {product.price}
                  <span className="line-through text-gray-400 text-[10px] sm:text-xs md:text-[13px] ml-2">
                    {product.oldPrice}
                  </span>
                </p>
              </div>

              <button className="mt-3 sm:mt-4 md:mt-5 w-full py-1.5 sm:py-2 text-xs sm:text-sm bg-[#7E5833] 
                text-[#F6F3E4] rounded-full hover:bg-[#5A3E25] transition-all duration-300">
                Add to Cart
              </button>
            </div>
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* ===== DESKTOP GRID VIEW (same as your original) ===== */}
      <div className="hidden lg:grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 
        gap-4 sm:gap-6 md:gap-8 lg:gap-10 px-2 sm:px-0">
        
        {products?.map((product, index) => (
          <motion.div
            key={index}
            whileHover={{ y: -8 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="bg-white rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg overflow-hidden flex flex-col p-1.5 sm:p-2 hover:cursor-pointer"
            onClick={() => router.push(`/Product/${product._id}`)}
          >
            {/* Image */}
            <div className="h-[200px] xs:h-[160px] sm:h-[180px] md:h-[200px] lg:h-[220px] relative">
              <img
                src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${product.imageUrls[0]}`}
                alt={product.name}
                className="object-cover rounded-lg sm:rounded-xl w-full h-full"
              />
            </div>

            <div className="p-3 sm:p-4 md:p-5 lg:p-6 flex flex-col flex-grow justify-between">
              <div>
                <h3 className="text-xs sm:text-sm md:text-[15px] font-semibold text-[#4A3A28] mb-2 text-center">
                  {product.name}
                </h3>

                <p className="text-[#7E5833] font-semibold text-xs sm:text-sm md:text-[15px] text-center">
                  {product.price}
                  <span className="line-through text-gray-400 text-[10px] sm:text-xs md:text-[13px] ml-2">
                    {product.oldPrice}
                  </span>
                </p>
              </div>

              <button className="mt-3 sm:mt-4 md:mt-5 w-full py-1.5 sm:py-2 text-xs sm:text-sm bg-[#7E5833] 
                text-[#F6F3E4] rounded-full hover:bg-[#5A3E25] transition-all duration-300">
                Add to Cart
              </button>
            </div>
          </motion.div>
        ))}
      </div>
      </div>
    </section>
  );
}