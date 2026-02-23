"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { FaShoppingCart, FaStar, FaStarHalfAlt } from "react-icons/fa";
import Navbar from "../components/Navbar";
import { productAPI } from "../lib/product";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import Link from "next/link";
import { useSelector } from "react-redux";
import { useRef } from "react";
import axios from "axios";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";





export default function ProductsPage() {
  const [categories] = useState([
    { name: "Money", img: "/money.webp" },
    { name: "Love", img: "/Love.webp" },
    { name: "Career", img: "/Carrer.webp" },
    { name: "Evil Eye", img: "/evileye.webp" },
    { name: "Health", img: "/Health.webp" },
    { name: "Gifting", img: "/gifting.webp" },
  ]);
const page = "products"
const [carousel, setCarousel] = useState()
const [loading1, setLoading1] = useState(true)
const { addToCart } = useCart();
const router = useRouter();

  const fetchCarousel = async () => {
    try {
      
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/api/admin/carousel/${page}`
      );
      
      setCarousel(res.data.carousel);
    } catch (error) {
      console.error("Error fetching carousel:", error);
    } finally {
      setLoading1(false);
    }
  };


  // 🟠 Hero Banner Images - Using high-quality astro-themed images
  const [heroBanners] = useState([
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1794&q=80",
      title: "Cosmic Energy Collection",
      subtitle: "Harness the power of universe",
      description: "Special 30% off on all astral products",
      buttonText: "Shop Now",
      buttonColor: "bg-purple-600 hover:bg-purple-700"
    },
  
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80",
      title: "Evil Eye Protection",
      subtitle: "Guard against negative energies",
      description: "Limited time offer - Buy 2 Get 1 Free",
      buttonText: "Get Protection",
      buttonColor: "bg-blue-600 hover:bg-blue-700"
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1771&q=80",
      title: "Festive Season Special",
      subtitle: "Divine blessings for you & loved ones",
      description: "Free shipping on orders above ₹999",
      buttonText: "View Offers",
      buttonColor: "bg-amber-600 hover:bg-amber-700"
    },
    {
      id: 5,
      image: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80",
      title: "Love & Relationships",
      subtitle: "Strengthen your emotional bonds",
      description: "New collection of love crystals & charms",
      buttonText: "Find Love",
      buttonColor: "bg-pink-600 hover:bg-pink-700"
    }
  ]);

  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    search: "",
    type: "",
    category: "",
    minPrice: "",
    maxPrice: "",
  });
const productsRef = useRef(null);
const swiperRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const types = useSelector((state) => state.productType.value)
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // 🟤 Fetch product types
  
const scrollToProducts = () => {
  if (productsRef.current) {
    productsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};


  // 🟤 Fetch all products (with filters)
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { products: data, totalPages } = await productAPI.getProducts(filters);
    
      setProducts((prev) =>
        filters.page === 1 ? data : [...prev, ...data]
      );
      setHasMore(filters.page < totalPages);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
    setLoading(false);
  };

  // 🟤 Fetch best sellers (top sold / featured)
  const fetchBestSellers = async () => {
    try {
      const { products: data } = await productAPI.getProducts({
        limit: 10,
        sortBy: "sold",
        order: "desc",
      });
      setBestSellers(data);
    } catch (err) {
      console.error("Error fetching best sellers:", err);
    }
  };

  useEffect(() => {
     fetchCarousel()
    fetchBestSellers();
  }, []);
 
  

  const handleCategoryClick = (category) => {
  scrollToProducts();
  setProducts([]);
  setFilters({ ...filters, category, page: 1 });
};


  const handleShowMore = () => {
    if (hasMore && !loading) {
      setFilters((prev) => ({ ...prev, page: prev.page + 1 }));
    }
  };


  

  // ⭐ Rating Stars
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={i} className="text-yellow-400" size={12} />);
    }
    if (hasHalf) stars.push(<FaStarHalfAlt key="half" className="text-yellow-400" size={12} />);
    for (let i = stars.length; i < 5; i++) {
      stars.push(<FaStar key={`empty-${i}`} className="text-gray-300" size={12} />);
    }
    return stars;
  };
  const applyFiltersAndFetch = () => {
  scrollToProducts();
  setProducts([]);
  setFilters((prev) => ({
    ...prev,
    page: 1,
    search: filters.search,
    type: filters.type,
    category: filters.category,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice
  }));
};

const resetFiltersAndFetch = () => {
  setProducts([]);

  setFilters({
    page: 1,
    limit: 20,
    search: "",
    type: "",
    category: "",
    minPrice: "",
    maxPrice: "",
  });

  setTimeout(() => {
    fetchProducts();
  }, 0);
};

useEffect(() =>{
  fetchProducts()

},[filters])

const handleAddToCart = async (e, productId) => {
  e.preventDefault(); // stop Link
  e.stopPropagation(); // stop card click

  try {
    await addToCart(productId, 1);
    toast.success("Added to cart!");
  } catch (err) {
    toast.error("Failed to add");
  }
};


  return (
    <>
      

      <div className="bg-[#f7f5ea]  min-h-screen ">
       
        {/* 🌟 HERO BANNER SLIDER */}
       <div className=" pt-28 sm:pt-32 lg:pt-36">  
<section className="h-[70vh] min-h-[480px] w-full overflow-hidden mt-6 relative">
    {carousel?.slides?.length > 0 && (
        <Swiper
    key={carousel.slides.length}   // 🔥 FORCE RE-INIT
    modules={[Autoplay, Pagination, EffectFade]}
    effect="fade"
    loop={carousel.slides.length > 3}
    observer
    observeParents
    autoplay={{
      delay: 3000,
      disableOnInteraction: false,
    }}
    pagination={{ clickable: true, dynamicBullets: true }}
    onSwiper={(swiper) => {
      swiperRef.current = swiper;
    }}
    className="h-full w-full"
  >

        {carousel.slides.map((slide) => (
          <SwiperSlide key={slide._id}>
            <div className="relative h-[70vh]  w-full overflow-hidden">
              {/* Background Image */}
              <img
                src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${slide.image}`}
                alt={slide.title}
                className="w-full h-full object-cover scale-100 transition-transform duration-700 hover:scale-[1.02] rounded-none"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/45 to-transparent z-[2]"></div>

              {/* Banner Content */}
              <div className="absolute inset-0 flex items-center z-[3]">
                <div className="max-w-6xl mx-auto px-6 lg:px-12 w-full">
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.9 }}
                    className="max-w-xl text-white"
                  >
                    {/* Title */}
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 leading-tight drop-shadow-lg">
                      {slide.title}
                    </h1>

                    {/* Subtitle */}
                    <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold mb-3 text-yellow-200">
                      {slide.subtitle}
                    </h2>

                    {/* Description */}
                    <p className="text-sm sm:text-base md:text-lg mb-6 text-gray-200">
                      {slide.description}
                    </p>

                    {/* Button */}
                    {slide.showButton && slide.buttonText && (
                      <a
                        href={slide.buttonLink}
                        className={`${slide.buttonColor} inline-block text-white px-6 sm:px-7 md:px-8 py-3 sm:py-3.5 md:py-4 rounded-xl font-semibold text-sm sm:text-base md:text-lg shadow-xl hover:scale-[1.06] transition-all duration-300`}
                      >
                        {slide.buttonText}
                      </a>
                    )}
                  </motion.div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute top-12 right-12 w-16 h-16 opacity-20 z-[1]">
                <div className="w-full h-full border border-white rounded-full animate-pulse"></div>
              </div>
              <div className="absolute bottom-14 left-14 w-10 h-10 opacity-25 z-[1]">
                <div className="w-full h-full border border-white rounded-full animate-spin-slow"></div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      )}

     
    </section>

        {/* 🟢 SHOP BY PURPOSE */}
        <section className="py-12 mt-6">
          <h2 className="text-center text-3xl font-semibold text-[#111111] mb-8 mt-6">
            Shop by Purpose
          </h2>
          <div className="flex flex-wrap justify-center gap-6 px-4">
            {categories.map((cat, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5, scale: 1.05 }}
                onClick={() => handleCategoryClick(cat.name)}
                className={`w-40 h-44 rounded-2xl flex flex-col items-center justify-center cursor-pointer ${
                  filters.category === cat.name
                    ? "border-[#b39976]"
                    : "border-transparent"
                } transition`}
              >
                <Image
                  src={cat.img}
                  alt={cat.name}
                  width={80}
                  height={100}
                  className="object-contain w-full h-full rounded-2xl"
                />
              </motion.div>
            ))}
          </div>
        </section>

        {/* 🟣 FILTERS */}
        <section className="max-w-6xl mx-auto bg-[#f7f5ea] rounded-2xl shadow p-6 mb-10">
          <h3 className="text-xl font-semibold text-[#111111] mb-4">
            Filter Products
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search by name"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="border border-[#b39976] rounded-xl p-3 w-full"
            />
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="border border-[#b39976] rounded-xl p-3"
            >
              <option value="">All Types</option>
              {types?types.map((t, i) => (
                <option key={i} value={t}>{t}</option>
              )):''}
            </select>
            <input
              type="number"
              placeholder="Min Price"
              value={filters.minPrice}
              onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              className="border border-[#b39976] rounded-xl p-3 w-full"
            />
            <input
              type="number"
              placeholder="Max Price"
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              className="border border-[#b39976] rounded-xl p-3 w-full"
            />
          </div>
          <div className="mt-4 flex justify-end gap-3">
          <button
  onClick={resetFiltersAndFetch}
  className="bg-gray-500 text-white px-5 py-2 rounded-xl"
>
  Reset
</button>

<button
  onClick={applyFiltersAndFetch}
  className="bg-[#7d5732] text-[#d6ccc0] px-5 py-2 rounded-xl"
>
  Apply Filters
</button>

          </div>
        </section>

        {/* 🟤 BEST SELLERS SLIDER */}
  {/* 🟤 BEST SELLERS SLIDER */}
<section className="max-w-6xl mx-auto mb-16 px-4  p-3">
  <h2 className="text-2xl font-semibold text-[#111111] mb-8 text-center">
    Best Sellers
  </h2>

  <div className=" p-6 non  h-fit ">
    <Swiper
      spaceBetween={25}
      grabCursor={true}
      loop={true}
      centeredSlides={false}
      autoplay={{
        delay: 3000,
        disableOnInteraction: false,
      }}
      pagination={{
        clickable: true,
        dynamicBullets: true,
      }}
      modules={[Pagination, Autoplay]}
      breakpoints={{
        320: { slidesPerView: 1.2 },
        480: { slidesPerView: 2 },
        768: { slidesPerView: 3 },
        1024: { slidesPerView: 4 },
        1280: { slidesPerView: 3 },
      }}
      className="border-amber-700  pb-10!  " // 👈 dots niche chale jayenge
    >
      {bestSellers.map((p, i) => (
        <SwiperSlide key={i}>
          
            <motion.div
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 200 }}
              className={`  rounded-2xl h-[340px] flex flex-col overflow-hidden transition-all hover:cursor-pointer
  ${
    p.stock === 0
      ? "bg-gray-100 shadow-lg shadow-gray-400/50"
      : "bg-white shadow-md  border-[#e7e7e7]"
  }
`}
onClick={() => {
    if (p.stock !== 0) {
      router.push(`/Product/${p._id}`);
    }
  }}


            >
              {p.offerPercent > 0 && (
  <div className="absolute top-2 right-2 z-10 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
    {p.offerPercent}% OFF
  </div>
)}

              {/* Image Height Fix */}
              <div className="w-full h-[200px] relative overflow-hidden">

                <img
                  src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${p.imageUrls?.[0] || "/placeholder.jpg"}`}
                  alt={p.name}
                  className="object-cover w-full h-full"
                />
                {p.stock === 0 && (
  <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-[1px]" />
)}

              </div>

              <div className="p-3 text-center flex flex-col justify-between flex-grow">
                <div>
                  <h4
                    className="font-semibold text-[#111111] text-sm mb-2 leading-snug line-clamp-2"
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: "2",
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {p.name}
                  </h4>

                 

                 <div className="font-semibold text-[#7d5732] mb-2 text-sm">
  {p.offerPercent > 0 ? (
    <>
      <span className="text-gray-400 line-through text-xs">
        ₹{p.price}
      </span>
      <span className="ml-2 text-[#7d5732] font-bold">
        ₹{p.discountedPrice}
      </span>
    </>
  ) : (
    <>₹{p.price}</>
  )}
</div>

                </div>
<button
  onClick={(e) => handleAddToCart(e, p._id)}
  disabled={p.stock === 0}
  className={`mt-2 py-1.5 px-3 sm:px-4 rounded-xl text-xs sm:text-sm transition flex items-center gap-2 justify-center mx-auto
    ${
      p.stock === 0
        ? "bg-gray-300 text-gray-600 cursor-not-allowed"
        : "bg-[#7d5732] text-[#d6ccc0] hover:bg-[#b39976]"
    }
  `}
>
  <FaShoppingCart size={14} />
  {p.stock === 0 ? "Out of Stock" : "Add"}
</button>
 <div className="flex items-center justify-center gap-1 mb-1 text-xs mt-3">
                    {renderStars(p.rating || 4.5)}
                    <span className="ml-2 text-[#9b9b9b]">
                      ({p.reviewCount || 100}+)
                    </span>
                  </div>

              </div>
            </motion.div>
          
        </SwiperSlide>
      ))}
    </Swiper>
  </div>
</section>


        {/* 🛍 OUR PRODUCTS GRID */}
        <section ref={productsRef} className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6">
  <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-[#111111] mb-6 text-center">
    Our Products
  </h2>

  <div className="
    grid
    grid-cols-2 
    
    sm:grid-cols-2 
    md:grid-cols-3 
    lg:grid-cols-4 
    gap-4 sm:gap-6 lg:gap-8 
    place-items-center
    max-[350px]:grid-cols-1
    pb-6
  ">
    {products.map((p, i) => (
      <Link key={i} href={`/Product/${p._id}`} onClick={(e) => {
  if (p.stock === 0) {
    e.preventDefault();
    return;
  }
}}
>
        <motion.div
          whileHover={{ scale: 1.03 }}
         className={`relative w-40 sm:w-48 md:w-56 rounded-2xl overflow-hidden transition-all
  ${
    p.stock === 0
      ? "bg-gray-100 shadow-lg shadow-gray-400/40"
      : "bg-white shadow-md"
  }
`}

        >
         <div className="relative">
  <img
    src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${p.imageUrls?.[0]}`}
    alt={p.name}
    className="object-cover h-32 sm:h-40 md:h-48 w-full"
  />

  {p.stock === 0 && (
    <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-[1px]" />
  )}

  {p.offerPercent > 0 && (
    <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-full">
      {p.offerPercent}% OFF
    </div>
  )}
</div>

          <div className="p-3 sm:p-4 text-center">
            <h4 className="font-semibold text-[#111111] text-xs sm:text-sm md:text-base leading-snug truncate">
              {p.name}
            </h4>

           

<div className="font-semibold text-[#7d5732] text-sm sm:text-base flex items-center justify-center gap-2">
  {p.offerPercent > 0 ? (
    <>
      <span className="text-gray-400 line-through text-xs block">
        ₹{p.price}
      </span>
      <span>₹{p.discountedPrice}</span>
    </>
  ) : (
    <>₹{p.price}</>
  )}
</div>

         <button
  onClick={(e) => handleAddToCart(e, p._id)}
  disabled={p.stock === 0}
  className={`mt-2 py-1.5 px-3 sm:px-4 rounded-xl text-xs sm:text-sm transition flex items-center gap-2 justify-center mx-auto
    ${
      p.stock === 0
        ? "bg-gray-300 text-gray-600 cursor-not-allowed"
        : "bg-[#7d5732] text-[#d6ccc0] hover:bg-[#b39976]"
    }
  `}
>
  <FaShoppingCart size={14} />
  {p.stock === 0 ? "Out of Stock" : "Add"}
</button>
 <div className="flex items-center justify-center gap-1 my-1 mt-3">
              {renderStars(p.rating || 4.5)}
              <span className="ml-2 text-[#9b9b9b] text-[10px] sm:text-xs">
                ({p.reviewCount || 100}+)
              </span>
            </div>
          </div>
        </motion.div>
      </Link>
    ))}
  </div>

  {hasMore && (
    <div className="flex justify-center mt-8 pb-6">
      <button
        onClick={handleShowMore}
        className="bg-[#7d5732] text-[#d6ccc0] px-6 py-3 rounded-2xl font-medium hover:bg-[#b39976] transition disabled:opacity-50"
      >
        {loading ? "Loading..." : "Show More"}
      </button>
    </div>
  )}
</section>

      </div>
      </div>
    </>
  );
}