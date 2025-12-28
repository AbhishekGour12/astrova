"use client";
import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  FaStar,
  FaShoppingCart,
  FaHeart,
  FaShare,
  FaCheck,
  FaTruck,
  FaShieldAlt,
  FaArrowRight,
  FaGem,
  FaLeaf,
  FaMountain,
  FaSun,
} from "react-icons/fa";

import { productAPI } from "../../lib/product";
import Navbar from "../../components/Navbar";
import CartSlideOut from "../../components/CartSlideOut";
import { useSelector } from "react-redux";
import useCheckLogin from "../../useCheckLogin";
import toast from "react-hot-toast";
import { useCart } from "../../context/CartContext";
import { useRouter } from "next/navigation";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/pagination";

// ------------------------ Floating Background Stars ------------------------
const FloatingElements = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-[#C06014]/10"
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            y: [0, -100, -200],
            scale: [0, 1, 0],
            opacity: [0, 0.3, 0],
          }}
          transition={{
            duration: 6 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 8,
          }}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            fontSize: `${8 + Math.random() * 12}px`,
          }}
        >
          <FaStar />
        </motion.div>
      ))}
    </div>
  );
};

const ProductShowcasePage = ({ params }) => {
  // ✅ Correct way to read dynamic route param
  const { id: productId } = React.use(params);

  const { addToCart } = useCart();
  const user = useSelector((state) => state.auth.user);
  const checkLogin = useCheckLogin();
  const router = useRouter();

  // ---------- State ----------
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);


  const [ratingSummary, setRatingSummary] = useState({
    avg: 0,
    count: 0,
    breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });

  const [showRatingForm, setShowRatingForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // ------------------------------------------------------------------
  // Fetch product + reviews (optimized, parallel)
  // ------------------------------------------------------------------
  const fetchProductPageData = useCallback(async () => {
    if (!productId) return;
    setIsLoading(true);

    try {
      // Product + Reviews in parallel
      const [product, reviewsList] = await Promise.all([
        productAPI.getProductById(productId),
        productAPI.getProductRatings(productId),
        
      ]);
      const likesRes = await productAPI.getProductLikesCount(productId);
setLikesCount(likesRes.count || 0);


      setSelectedProduct(product);
      setReviews(reviewsList);

      // Rating summary
      const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      reviewsList.forEach((r) => {
        if (breakdown[r.rating] !== undefined) breakdown[r.rating] += 1;
      });

      setRatingSummary({
        avg: product.rating || 0,
        count: reviewsList.length,
        breakdown,
      });

      // Similar products
      const similar = await productAPI.getProducts({
        type: product.productType,
        featured: true,
        limit: 4,
      });
      setSimilarProducts(similar.products || []);

      // Wishlist state (only if logged in)
      if (user) {
        const liked = await productAPI.checkUserInterest(productId);
        setIsLiked(!!liked?.isLiked);
      } else {
        setIsLiked(false);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load product");
    }

    setIsLoading(false);
  }, [productId, user]);

  useEffect(() => {
    fetchProductPageData();
  }, [fetchProductPageData]);

  // ------------------------------------------------------------------
  // Quantity Controls
  // ------------------------------------------------------------------
 const incrementQty = () => {
  if (!selectedProduct || selectedProduct.stock === 0) return;

  if (quantity < selectedProduct.stock) {
    setQuantity((q) => q + 1);
  }
};

const decrementQty = () => {
  if (selectedProduct?.stock === 0) return;

  setQuantity((q) => (q > 1 ? q - 1 : 1));
};

  // ------------------------------------------------------------------
  // Add to Cart (supports guest + logged-in via CartContext)
  // ------------------------------------------------------------------
  const handleAddToCart = async () => {
    if (!selectedProduct) return;
    await addToCart(productId, quantity); // context will handle guest/localStorage or API
  };

  // ------------------------------------------------------------------
  // LIKE / WISHLIST
  // ------------------------------------------------------------------
  const handleToggleLike = async () => {
  if (!checkLogin()) return;

  try {
    if (isLiked) {
      await productAPI.removeUserInterest(productId);
      setIsLiked(false);
      setLikesCount((c) => Math.max(0, c - 1));
    } else {
      await productAPI.addUserInterest(productId);
      setIsLiked(true);
      setLikesCount((c) => c + 1);
    }
  } catch (err) {
    toast.error(err.message || "Something went wrong");
  }
};

  // ------------------------------------------------------------------
  // Rating: show form
  // ------------------------------------------------------------------
  const showRating = () => {
    if (!checkLogin()) return;
    setShowRatingForm(true);
  };

  // ------------------------------------------------------------------
  // SUBMIT RATING
  // ------------------------------------------------------------------
  const handleSubmitRating = async (e) => {
  e.preventDefault();
  if (!checkLogin()) return;
  if (!rating) return toast.error("Please select rating");

  try {
    await productAPI.submitRating({
      productId,
      rating: Number(rating),
      review,
    });

    toast.success("Review submitted!");

    // 🔁 Re-fetch updated reviews
    const updatedReviews = await productAPI.getProductRatings(productId);
    setReviews(updatedReviews);

    // 🔄 Recalculate summary
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    updatedReviews.forEach((r) => {
      if (breakdown[r.rating] !== undefined) breakdown[r.rating] += 1;
    });

    const count = updatedReviews.length;
    const avg =
      count === 0
        ? 0
        : updatedReviews.reduce((sum, r) => sum + r.rating, 0) / count;

    setRatingSummary({
      avg: avg.toFixed(1),
      count,
      breakdown,
    });
    
    // Reset form
    setShowRatingForm(false);
    setRating(0);
    setReview("");
    fetchProductPageData()
  } catch (err) {
    toast.error(err.error || err.message || "Something went wrong");
  }
};
const handleShare = async () => {
  const shareUrl = `${window.location.origin}/Product/${productId}`;
  const shareData = {
    title: selectedProduct?.name,
    text: `Check out this product on MyAstrova 🌟`,
    url: shareUrl,
  };

  try {
    // ✅ Modern browsers & mobile
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      // ✅ Fallback for desktop
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Product link copied to clipboard!");
    }
  } catch (err) {
    console.error(err);
    toast.error("Unable to share right now");
  }
};


  // ------------------------------------------------------------------
  // IMAGE HOVER
  // ------------------------------------------------------------------
  const handleImageHover = (index) => {
    setSelectedImageIndex(index);
  };

  // ------------------------------------------------------------------
  // LOADING STATES
  // ------------------------------------------------------------------
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F3E9] flex items-center justify-center px-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-[#C06014] to-[#D47C3A] rounded-full flex items-center justify-center mx-auto mb-4">
            <FaGem className="text-white text-2xl animate-pulse" />
          </div>
          <p className="text-[#003D33] text-base sm:text-lg">
            Loading Cosmic Treasures...
          </p>
        </motion.div>
      </div>
    );
  }

  if (!selectedProduct) {
    return (
      <div className="min-h-screen bg-[#F7F3E9] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-[#003D33] text-base sm:text-lg">Product not found</p>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------------
  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-[#F7F3E9] via-[#ECE5D3] to-[#F7F3E9] relative">
        <FloatingElements />

        {/* Background circles */}
        <div className="absolute top-10 left-6 sm:left-10 w-16 sm:w-24 h-16 sm:h-24 bg-[#C06014] rounded-full opacity-10 blur-xl"></div>
        <div className="absolute bottom-20 right-6 sm:right-20 w-14 sm:w-20 h-14 sm:h-20 bg-[#00695C] rounded-full opacity-10 blur-lg"></div>

        <div className="container mx-auto px-3 sm:px-4 md:px-6 py-8 max-w-7xl pt-28 sm:pt-32 lg:pt-36 relative z-10">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm text-[#00695C] mb-4 sm:mb-8"
          >
            <span>Home</span>
            <span>/</span>
            <span>Shop</span>
            <span>/</span>
            <span className="truncate max-w-[120px] sm:max-w-[200px]">
              {selectedProduct?.category}
            </span>
            <span>/</span>
            <span className="text-[#003D33] font-semibold truncate max-w-[160px] sm:max-w-[260px]">
              {selectedProduct?.name}
            </span>
          </motion.div>

          {/* Main Product Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 mb-12 lg:mb-16">
            {/* LEFT: Product Images + rating box */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4 sm:space-y-6"
            >
              {/* Main Image */}
              <div className="rounded-3xl shadow-lg overflow-hidden">
                <motion.img
                  key={selectedImageIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${selectedProduct?.imageUrls[selectedImageIndex]}`}
                  alt={selectedProduct?.name}
                  className="w-full h-64 sm:h-80 lg:h-96 object-cover rounded-2xl cursor-zoom-in"
                />
              </div>

              {/* Thumbnail Images */}
              <div className="grid grid-cols-4 gap-2 sm:gap-3 md:gap-4 px-1 sm:px-2 md:px-4">
                {selectedProduct?.imageUrls.map((image, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`aspect-square bg-white rounded-xl border-2 cursor-pointer overflow-hidden ${
                      selectedImageIndex === index
                        ? "border-[#C06014] shadow-md"
                        : "border-[#B2C5B2] hover:border-[#C06014]"
                    }`}
                    onMouseOver={() => handleImageHover(index)}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img
                      src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${image}`}
                      alt={`thumb-${index}`}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                ))}
              </div>

              {/* Rating Breakdown */}
              <div className="bg-[#ECE5D3] p-4 sm:p-5 rounded-2xl border border-[#C06014]/20 w-full lg:w-72">
                <h3 className="text-sm sm:text-md font-semibold text-[#003D33] mb-3">
                  Rating Overview
                </h3>

                {Object.entries(ratingSummary.breakdown)
                  .sort((a, b) => Number(b[0]) - Number(a[0]))
                  .map(([star, count]) => {
                    const percent = ratingSummary.count
                      ? Math.round((count / ratingSummary.count) * 100)
                      : 0;

                    return (
                      <div key={star} className="flex items-center gap-2 my-1">
                        <span className="w-8 text-[#003D33] font-semibold text-xs sm:text-sm">
                          {star}★
                        </span>

                        <div className="flex-1 h-2 bg-white rounded-full overflow-hidden">
                          <div
                            style={{ width: `${percent}%` }}
                            className="h-full bg-[#C06014] rounded-full transition-all duration-300"
                          ></div>
                        </div>

                        <span className="w-10 text-[#00695C] text-xs">
                          {percent}%
                        </span>
                      </div>
                    );
                  })}
              </div>
            </motion.div>

            {/* RIGHT: Product Details */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-5 sm:space-y-6"
            >
              {/* Category + Rating */}
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 sm:gap-6">
                <div className="flex items-center justify-between lg:justify-start gap-3 sm:gap-4 flex-1">
                  <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#ECE5D3] text-[#00695C] rounded-full text-xs sm:text-sm font-semibold">
                    {selectedProduct?.category}
                  </span>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-amber-400 text-xs sm:text-sm">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={
                            i < Math.floor(selectedProduct?.rating || 0)
                              ? "fill-current"
                              : "text-gray-300"
                          }
                        />
                      ))}
                    </div>

                    <span className="text-[#00695C] text-xs sm:text-sm">
                      {selectedProduct?.rating} ({selectedProduct?.reviewCount} reviews)
                    </span>
                  </div>
                </div>
              </div>

              {/* Product Name */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#003D33] leading-tight">
                {selectedProduct?.name}
              </h1>

             {/* Price + Offer */}
<div className="flex flex-wrap items-center gap-3">
  {selectedProduct?.offerPercent > 0 ? (
    <>
      {/* MRP */}
      <span className="text-sm text-gray-400 line-through">
        ₹{selectedProduct.price}
      </span>

      {/* Discounted price */}
      <span className="text-2xl sm:text-3xl font-bold text-[#C06014]">
        ₹{selectedProduct.discountedPrice}
      </span>

      {/* Offer badge */}
      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
        {selectedProduct.offerPercent}% OFF
      </span>
    </>
  ) : (
    <span className="text-2xl sm:text-3xl font-bold text-[#C06014]">
      ₹{selectedProduct.price}
    </span>
  )}

  {/* Low stock warning */}
  {selectedProduct.stock > 0 && selectedProduct.stock < 10 && (
    <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-semibold">
      Only {selectedProduct.stock} left!
    </span>
  )}
</div>


              {/* Description */}
              <p className="text-sm sm:text-base lg:text-lg text-[#00695C] leading-relaxed">
                {selectedProduct?.description}
              </p>

              {/* Features */}
              <div className="space-y-3">
                <h3 className="text-lg sm:text-xl font-semibold text-[#003D33]">
                  MyAstrova Features:
                </h3>
                {selectedProduct?.features && selectedProduct?.features.length > 0 ? (
                  <div className="grid grid-cols-1 gap-2">
                    {selectedProduct?.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-[#C06014] rounded-full flex items-center justify-center flex-shrink-0">
                          <FaCheck className="text-white text-[10px] sm:text-xs" />
                        </div>
                        <span className="text-xs sm:text-sm md:text-base text-[#00695C]">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-[#C06014] rounded-full flex items-center justify-center flex-shrink-0">
                      <FaCheck className="text-white text-[10px] sm:text-xs" />
                    </div>
                    <span className="text-xs sm:text-sm md:text-base text-[#00695C] italic">
                      This MyAstrova product comes with unique blessings and natural benefits.
                    </span>
                  </div>
                )}
              </div>

              {/* Quantity Selector */}
              <div className="space-y-2 sm:space-y-3">
                <h3 className="text-lg sm:text-xl font-semibold text-[#003D33]">
                  Quantity:
                </h3>
                <div className="flex items-center flex-wrap gap-3 sm:gap-4">
                 <div className="flex items-center border border-[#B2C5B2] rounded-2xl overflow-hidden">
  <button
    onClick={decrementQty}
    disabled={selectedProduct.stock === 0 || quantity === 1}
    className="px-4 py-3 bg-[#ECE5D3] disabled:opacity-40 disabled:cursor-not-allowed"
  >
    -
  </button>

  <span className="px-6 py-3 bg-white text-[#003D33] font-semibold">
    {quantity}
  </span>

  <button
    onClick={incrementQty}
    disabled={
      selectedProduct.stock === 0 ||
      quantity >= selectedProduct.stock
    }
    className="px-4 py-3 bg-[#ECE5D3] disabled:opacity-40 disabled:cursor-not-allowed"
  >
    +
  </button>
</div>

                  <span className="text-xs sm:text-sm text-[#00695C]">
                    {selectedProduct?.stock} available
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6">
               <motion.button
  disabled={selectedProduct.stock === 0}
  onClick={handleAddToCart}
  className={`flex-1 py-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-3
    ${
      selectedProduct.stock === 0
        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
        : "bg-gradient-to-r from-[#003D33] to-[#00695C] text-white hover:shadow-lg"
    }`}
>
  <FaShoppingCart />
  {selectedProduct.stock === 0 ? "Out of Stock" : "Add to MyAstrova Cart"}
</motion.button>


             <motion.button
  disabled={selectedProduct.stock === 0}
  className={`flex-1 py-4 rounded-2xl font-semibold text-lg
    ${
      selectedProduct.stock === 0
        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
        : "bg-gradient-to-r from-[#C06014] to-[#D47C3A] text-white hover:shadow-lg"
    }`}
>
  Buy Now with Blessings
</motion.button>

              </div>

              {/* Secondary Actions */}
              <div className="flex flex-col items-center gap-2">
  <div className="flex gap-3 sm:gap-4 justify-center">
    <motion.button
      whileHover={{ scale: 1.05 }}
      onClick={handleToggleLike}
      className={`p-2.5 sm:p-3 rounded-2xl border transition-all duration-300 flex items-center gap-2
        ${
          isLiked
            ? "bg-red-500 border-red-500 text-white"
            : "bg-white border-[#B2C5B2] text-[#00695C] hover:bg-[#C06014] hover:text-white"
        }`}
    >
      <FaHeart className="text-base sm:text-lg" />
      <span className="text-xs sm:text-sm font-semibold">
        {isLiked ? "Liked" : "Like"}
      </span>
    </motion.button>

    <motion.button
  whileHover={{ scale: 1.05 }}
  onClick={handleShare}
  className="p-2.5 sm:p-3 rounded-2xl bg-white border border-[#B2C5B2] text-[#00695C] hover:bg-[#C06014] hover:text-white transition-all duration-300"
>
  <FaShare className="text-base sm:text-lg" />
</motion.button>

  </div>

  {/* ❤️ Likes Count */}
  <p className="text-xs sm:text-sm text-[#00695C]">
    ❤️ {likesCount} people love this product
  </p>
</div>


           {/* Trust Badges */}
<div className="grid grid-cols-3 gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-[#B2C5B2]">
  {[
    {
      icon: FaTruck,
      text: "Fast Delivery",
      subtext: "Pan India Shipping",
    },
    {
      icon: FaShieldAlt,
      text: "Secure Payment",
      subtext: "256-bit SSL",
    },
    {
      icon: FaLeaf,
      text: "Authentic Products",
      subtext: "Energized & Verified",
    },
  ].map((item, index) => (
    <div key={index} className="text-center">
      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#ECE5D3] rounded-full flex items-center justify-center mx-auto mb-1.5 sm:mb-2">
        <item.icon className="text-[#C06014] text-lg sm:text-xl" />
      </div>
      <div className="text-xs sm:text-sm font-semibold text-[#003D33]">
        {item.text}
      </div>
      <div className="text-[10px] sm:text-xs text-[#00695C]">
        {item.subtext}
      </div>
    </div>
  ))}
</div>

            </motion.div>
          </div>

          {/* Rating Form Section */}
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl border border-[#B2C5B2] p-5 sm:p-8 mb-10 sm:mb-16"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-5 sm:mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-[#003D33]">
                Share Your Experience
              </h3>
              {!showRatingForm && (
                <button
                  onClick={showRating}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 bg-[#C06014] text-white rounded-2xl font-semibold text-sm sm:text-base hover:bg-[#D47C3A] transition-colors"
                >
                  Write a Review
                </button>
              )}
            </div>

            {showRatingForm && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                onSubmit={handleSubmitRating}
                className="space-y-5 sm:space-y-6"
              >
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-[#003D33] mb-2 sm:mb-3">
                    Your Rating *
                  </label>
                  <div className="flex items-center gap-2 sm:gap-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="text-2xl sm:text-3xl focus:outline-none transition-transform hover:scale-110"
                      >
                        <FaStar
                          className={star <= rating ? "text-amber-400" : "text-gray-300"}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-[#003D33] mb-2 sm:mb-3">
                    Your Review
                  </label>
                  <textarea
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    rows="4"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-[#B2C5B2] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#C06014] focus:border-transparent resize-none text-sm sm:text-base"
                    placeholder="Share your thoughts about this sacred product..."
                  />
                </div>

                <div className="flex flex-wrap gap-3 sm:gap-4">
                  <button
                    type="submit"
                    disabled={rating === 0}
                    className="px-6 sm:px-8 py-2.5 sm:py-3 bg-[#C06014] text-white rounded-2xl font-semibold text-sm sm:text-base hover:bg-[#D47C3A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit Review
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRatingForm(false)}
                    className="px-6 sm:px-8 py-2.5 sm:py-3 bg-gray-100 text-gray-600 rounded-2xl font-semibold text-sm sm:text-base hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </motion.form>
            )}
          </motion.section>
         
          {/* ALL REVIEWS SECTION */}
<motion.section
  initial={{ opacity: 0, y: 40 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.25 }}
  className="bg-white rounded-3xl border border-[#B2C5B2] p-5 sm:p-8 mb-10 sm:mb-16"
>
  <h3 className="text-xl sm:text-2xl font-bold text-[#003D33] mb-6">
    Customer Reviews ({ratingSummary.count})
  </h3>

  {reviews.length === 0 ? (
    <p className="text-[#00695C] italic">
      No reviews yet. Be the first to share your experience 🌟
    </p>
  ) : (
   
 <div className="space-y-6 max-h-[200px] overflow-y-auto pr-2
                scrollbar-thin scrollbar-thumb-[#C06014]/60
                scrollbar-track-transparent">
  {reviews.map((r) => (
    <div
      key={r._id}
      className="border-b border-[#B2C5B2]/60 pb-5 last:border-none"
    >
      {/* User + Rating */}
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold text-[#003D33]">
          {r.userId?.username || "Anonymous"}
        </div>

        <div className="flex gap-1 text-amber-400">
          {[...Array(5)].map((_, i) => (
            <FaStar
              key={i}
              className={i < r.rating ? "fill-current" : "text-gray-300"}
            />
          ))}
        </div>
      </div>

      {/* Review */}
      {r.review && (
        <p className="text-[#00695C] text-sm leading-relaxed">
          {r.review}
        </p>
      )}

      {/* Date */}
      <p className="text-xs text-gray-400 mt-2">
        {new Date(r.createdAt).toLocaleDateString()}
      </p>
    </div>
  ))}
</div>

    
  
  )}
</motion.section>

          {/* Similar Products Section */}
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-10 sm:mb-16"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#003D33] flex items-center gap-2 sm:gap-3">
                <FaGem className="text-[#C06014]" />
                <span>Similar Cosmic Treasures</span>
              </h2>

              <button
                className="text-sm sm:text-base text-[#C06014] font-semibold hover:text-[#D47C3A] transition-colors flex items-center gap-1 sm:gap-2"
                onClick={() => router.push("/ProductsPage")}
              >
                View All <FaArrowRight />
              </button>
            </div>

            {/* Desktop Grid */}
            <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
              {similarProducts.map((product) => (
                <motion.div
                  key={product._id}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-3xl border border-[#B2C5B2] overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${product.imageUrls[0]}`}
                      alt={product.name}
                      className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                  <div className="p-4 sm:p-6">
                    <h3 className="font-semibold text-[#003D33] text-sm sm:text-base line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-[#00695C] text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
                      {product.description}
                    </p>
                    <p className="text-lg sm:text-xl font-bold text-[#C06014]">
                      ₹{product.price}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Mobile Slider */}
            <div className="md:hidden">
              <Swiper
                spaceBetween={15}
                grabCursor={true}
                loop={true}
                autoplay={{
                  delay: 3000,
                  disableOnInteraction: false,
                }}
                pagination={{ clickable: true }}
                modules={[Pagination, Autoplay]}
                breakpoints={{
                  0: { slidesPerView: 1.1 },
                  400: { slidesPerView: 1.4 },
                  640: { slidesPerView: 2 },
                }}
                className="pb-8"
              >
                {similarProducts.map((product) => (
                  <SwiperSlide key={product._id}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-white rounded-3xl border border-[#B2C5B2] overflow-hidden shadow-lg transition-all duration-300"
                    >
                      <img
                        src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${product.imageUrls[0]}`}
                        alt={product.name}
                        className="w-full h-48 object-cover"
                      />

                      <div className="p-4">
                        <h3 className="font-semibold text-[#003D33] text-sm line-clamp-2">
                          {product.name}
                        </h3>
                        <p className="text-[#00695C] text-xs line-clamp-2">
                          {product.description}
                        </p>
                        <p className="text-lg font-bold text-[#C06014]">
                          ₹{product.price}
                        </p>
                      </div>
                    </motion.div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </motion.section>

          {/* Product Details Tabs (Benefits + Care) */}
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-3xl border border-[#B2C5B2] p-5 sm:p-8 mb-10 sm:mb-16"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              {/* Spiritual Benefits */}
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#003D33] mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <FaLeaf className="text-[#C06014]" />
                  <span>Spiritual Benefits</span>
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  {[
                    "Enhances meditation and spiritual practice",
                    "Brings balance to your energy centers",
                    "Promotes emotional healing and clarity",
                    "Connects you with cosmic energies",
                    "Supports personal growth and transformation",
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-[#C06014] rounded-full flex items-center justify-center flex-shrink-0">
                        <FaSun className="text-white text-[10px] sm:text-xs" />
                      </div>
                      <span className="text-xs sm:text-sm md:text-base text-[#00695C]">
                        {benefit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Care Instructions */}
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#003D33] mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <FaMountain className="text-[#C06014]" />
                  <span>Sacred Care Instructions</span>
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  {[
                    "Cleanse under moonlight monthly",
                    "Charge with positive intentions",
                    "Keep away from negative energies",
                    "Store in sacred space when not in use",
                    "Handle with respect and gratitude",
                  ].map((instruction, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-[#00695C] rounded-full flex items-center justify-center flex-shrink-0">
                        <FaCheck className="text-white text-[10px] sm:text-xs" />
                      </div>
                      <span className="text-xs sm:text-sm md:text-base text-[#00695C]">
                        {instruction}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.section>
        </div>
      </div>

      {/* Cart Slide Out - uses CartContext internally (Option A) */}
      <CartSlideOut />
    </>
  );
};

export default ProductShowcasePage;
