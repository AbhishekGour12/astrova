"use client"
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaStar, 
  FaShoppingCart, 
  FaHeart, 
  FaShare,
  FaCheck,
  FaTruck,
  FaShieldAlt,
  FaArrowLeft,
  FaArrowRight,
  FaGem,
  FaLeaf,
  FaMountain,
  FaSun
} from 'react-icons/fa';

const ProductShowcasePage = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [similarProducts, setSimilarProducts] = useState([]);

  // Sample product data matching your schema
  const products = [
    {
      _id: "1",
      name: "Sacred Healing Crystal Set",
      description: "A carefully curated collection of 7 chakra healing crystals for energy balance, spiritual growth, and cosmic connection. Each crystal is hand-selected for its purity and vibrational energy.",
      price: 49.99,
      stock: 15,
      category: "Crystals",
      imageUrls: [
        "https://images.unsplash.com/photo-1542736667-4dafd4b0e6d9?w=800",
        "https://images.unsplash.com/photo-1532767153582-b1a0e5145009?w=800",
        "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800",
        "https://images.unsplash.com/photo-1584839409338-5d7d70f5b6fc?w=800"
      ],
      isFeatured: true,
      features: [
        "7 Chakra Balancing Stones",
        "Natural Energy Cleansing",
        "Hand-polished & Charged",
        "Includes Guidance Booklet"
      ],
      rating: 4.8,
      reviewCount: 127
    },
    {
      _id: "2",
      name: "Zodiac Birthstone Bracelet",
      description: "Personalized zodiac bracelet with your birthstone, crafted to enhance your natural energies and provide cosmic protection throughout your journey.",
      price: 34.99,
      stock: 8,
      category: "Jewelry",
      imageUrls: [
        "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800",
        "https://images.unsplash.com/photo-1542736667-4dafd4b0e6d9?w=800",
        "https://images.unsplash.com/photo-1532767153582-b1a0e5145009?w=800"
      ],
      isFeatured: false,
      features: [
        "Personalized Zodiac Stone",
        "Sterling Silver Chain",
        "Energy Charged",
        "Adjustable Size"
      ],
      rating: 4.6,
      reviewCount: 89
    },
    {
      _id: "3",
      name: "Ancient Tarot Card Deck",
      description: "Premium tarot deck with guidebook for spiritual guidance and self-discovery. Connect with ancient wisdom through beautifully illustrated cards.",
      price: 39.99,
      stock: 20,
      category: "Spiritual Tools",
      imageUrls: [
        "https://images.unsplash.com/photo-1584839409338-5d7d70f5b6fc?w=800",
        "https://images.unsplash.com/photo-1542736667-4dafd4b0e6d9?w=800",
        "https://images.unsplash.com/photo-1532767153582-b1a0e5145009?w=800"
      ],
      isFeatured: true,
      features: [
        "78 Card Deck",
        "Detailed Guidebook",
        "Velvet Storage Bag",
        "Beginner Friendly"
      ],
      rating: 4.9,
      reviewCount: 203
    },
    {
      _id: "4",
      name: "Meditation Yantra Set",
      description: "Sacred geometric yantras for deep meditation and spiritual practice. Each yantra is crafted with precision to enhance your meditation experience.",
      price: 29.99,
      stock: 12,
      category: "Meditation",
      imageUrls: [
        "https://images.unsplash.com/photo-1532767153582-b1a0e5145009?w=800",
        "https://images.unsplash.com/photo-1584839409338-5d7d70f5b6fc?w=800",
        "https://images.unsplash.com/photo-1542736667-4dafd4b0e6d9?w=800"
      ],
      isFeatured: false,
      features: [
        "5 Sacred Yantras",
        "Copper Plated",
        "Meditation Guide",
        "Energy Charged"
      ],
      rating: 4.7,
      reviewCount: 64
    }
  ];

  useEffect(() => {
    // Simulate API call to fetch product
    const fetchProduct = async () => {
      setIsLoading(true);
      // In real app, you'd fetch by ID from URL params
      // const productId = window.location.pathname.split('/').pop();
      // const response = await fetch(`/api/products/${productId}`);
      // const product = await response.json();
      
      setTimeout(() => {
        setSelectedProduct(products[0]);
        setSimilarProducts(products.slice(1));
        setIsLoading(false);
      }, 1000);
    };

    fetchProduct();
  }, []);

  const handleImageHover = (index) => {
    setSelectedImageIndex(index);
  };

  const handleAddToCart = () => {
    // Add to cart logic here
    console.log('Added to cart:', { ...selectedProduct, quantity });
  };

  const handleBuyNow = () => {
    // Buy now logic here
    console.log('Buy now:', { ...selectedProduct, quantity });
  };

  const FloatingElements = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-[#C06014]/10"
          initial={{ 
            scale: 0,
            opacity: 0
          }}
          animate={{ 
            y: [0, -100, -200],
            scale: [0, 1, 0],
            opacity: [0, 0.3, 0]
          }}
          transition={{
            duration: 6 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 8
          }}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            fontSize: `${8 + Math.random() * 12}px`
          }}
        >
          <FaStar />
        </motion.div>
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F3E9] flex items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-[#C06014] to-[#D47C3A] rounded-full flex items-center justify-center mx-auto mb-4">
            <FaGem className="text-white text-2xl animate-pulse" />
          </div>
          <p className="text-[#003D33] text-lg">Loading Cosmic Treasures...</p>
        </motion.div>
      </div>
    );
  }

  if (!selectedProduct) {
    return (
      <div className="min-h-screen bg-[#F7F3E9] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#003D33] text-lg">Product not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F3E9] via-[#ECE5D3] to-[#F7F3E9]">
      <FloatingElements />
      
      {/* Background Elements */}
      <div className="absolute top-10 left-10 w-24 h-24 bg-[#C06014] rounded-full opacity-10 blur-xl"></div>
      <div className="absolute bottom-20 right-20 w-20 h-20 bg-[#00695C] rounded-full opacity-10 blur-lg"></div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm text-[#00695C] mb-8"
        >
          <span>Home</span>
          <span>/</span>
          <span>Shop</span>
          <span>/</span>
          <span>{selectedProduct.category}</span>
          <span>/</span>
          <span className="text-[#003D33] font-semibold">{selectedProduct.name}</span>
        </motion.div>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Product Images */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {/* Main Image */}
            <div className="bg-white rounded-3xl p-8 border border-[#B2C5B2] shadow-lg overflow-hidden">
              <motion.img
                key={selectedImageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                src={selectedProduct.imageUrls[selectedImageIndex]}
                alt={selectedProduct.name}
                className="w-full h-96 object-cover rounded-2xl cursor-zoom-in"
              />
            </div>

            {/* Thumbnail Images */}
            <div className="flex gap-4 overflow-x-auto pb-4">
              {selectedProduct.imageUrls.map((image, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex-shrink-0 w-20 h-20 bg-white rounded-2xl border-2 cursor-pointer overflow-hidden ${
                    selectedImageIndex === index 
                      ? 'border-[#C06014] shadow-md' 
                      : 'border-[#B2C5B2] hover:border-[#C06014]'
                  }`}
                  onMouseEnter={() => handleImageHover(index)}
                  onClick={() => handleImageHover(index)}
                >
                  <img
                    src={image}
                    alt={`${selectedProduct.name} view ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Product Details */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Category & Rating */}
            <div className="flex items-center justify-between">
              <span className="px-4 py-2 bg-[#ECE5D3] text-[#00695C] rounded-full text-sm font-semibold">
                {selectedProduct.category}
              </span>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={i < Math.floor(selectedProduct.rating) ? "fill-current" : "text-gray-300"}
                    />
                  ))}
                </div>
                <span className="text-[#00695C] text-sm">
                  {selectedProduct.rating} ({selectedProduct.reviewCount} reviews)
                </span>
              </div>
            </div>

            {/* Product Name */}
            <h1 className="text-4xl font-bold text-[#003D33] leading-tight">
              {selectedProduct.name}
            </h1>

            {/* Price */}
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-[#C06014]">
                ${selectedProduct.price}
              </span>
              {selectedProduct.stock < 10 && (
                <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-semibold">
                  Only {selectedProduct.stock} left!
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-lg text-[#00695C] leading-relaxed">
              {selectedProduct.description}
            </p>

            {/* Features */}
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-[#003D33]">Sacred Features:</h3>
              <div className="grid grid-cols-1 gap-2">
                {selectedProduct.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-[#C06014] rounded-full flex items-center justify-center">
                      <FaCheck className="text-white text-xs" />
                    </div>
                    <span className="text-[#00695C]">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-[#003D33]">Quantity:</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-[#B2C5B2] rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-3 bg-[#ECE5D3] hover:bg-[#C06014] hover:text-white transition-colors"
                  >
                    -
                  </button>
                  <span className="px-6 py-3 bg-white text-[#003D33] font-semibold">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(selectedProduct.stock, quantity + 1))}
                    className="px-4 py-3 bg-[#ECE5D3] hover:bg-[#C06014] hover:text-white transition-colors"
                  >
                    +
                  </button>
                </div>
                <span className="text-[#00695C]">
                  {selectedProduct.stock} available
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                className="flex-1 bg-gradient-to-r from-[#003D33] to-[#00695C] text-white py-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-3 transition-all duration-300 hover:shadow-lg hover:shadow-[#003D33]/30"
              >
                <FaShoppingCart />
                Add to Sacred Cart
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBuyNow}
                className="flex-1 bg-gradient-to-r from-[#C06014] to-[#D47C3A] text-white py-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-3 transition-all duration-300 hover:shadow-lg hover:shadow-[#C06014]/30"
              >
                Buy Now with Blessings
              </motion.button>
            </div>

            {/* Secondary Actions */}
            <div className="flex gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="p-3 rounded-2xl bg-white border border-[#B2C5B2] text-[#00695C] hover:bg-[#C06014] hover:text-white transition-all duration-300"
              >
                <FaHeart className="text-lg" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="p-3 rounded-2xl bg-white border border-[#B2C5B2] text-[#00695C] hover:bg-[#C06014] hover:text-white transition-all duration-300"
              >
                <FaShare className="text-lg" />
              </motion.button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#B2C5B2]">
              {[
                { icon: FaTruck, text: "Free Shipping", subtext: "Over $50" },
                { icon: FaShieldAlt, text: "Secure Payment", subtext: "256-bit SSL" },
                { icon: FaLeaf, text: "Eco Friendly", subtext: "Sustainable" }
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-[#ECE5D3] rounded-full flex items-center justify-center mx-auto mb-2">
                    <item.icon className="text-[#C06014] text-xl" />
                  </div>
                  <div className="text-sm font-semibold text-[#003D33]">{item.text}</div>
                  <div className="text-xs text-[#00695C]">{item.subtext}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Similar Products Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-16"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-[#003D33] flex items-center gap-3">
              <FaGem className="text-[#C06014]" />
              Similar Cosmic Treasures
            </h2>
            <button className="text-[#C06014] font-semibold hover:text-[#D47C3A] transition-colors flex items-center gap-2">
              View All <FaArrowRight />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {similarProducts.map((product) => (
              <motion.div
                key={product._id}
                whileHover={{ y: -5 }}
                className="bg-white rounded-3xl border border-[#B2C5B2] overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={product.imageUrls[0]}
                    alt={product.name}
                    className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
                  />
                  {product.isFeatured && (
                    <div className="absolute top-4 left-4 bg-[#C06014] text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Featured
                    </div>
                  )}
                  <button className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-all duration-300 transform translate-y-2 hover:translate-y-0">
                    <FaHeart className="text-red-500" />
                  </button>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-3 py-1 bg-[#ECE5D3] text-[#00695C] rounded-full text-xs font-semibold">
                      {product.category}
                    </span>
                    <div className="flex items-center gap-1 text-amber-400 text-sm">
                      <FaStar />
                      <span className="text-[#00695C]">{product.rating}</span>
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-[#003D33] mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  
                  <p className="text-[#00695C] text-sm mb-4 line-clamp-2">
                    {product.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-[#C06014]">
                      ${product.price}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-[#003D33] text-white px-4 py-2 rounded-2xl text-sm font-semibold hover:bg-[#00695C] transition-colors"
                    >
                      Add to Cart
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Product Details Tabs */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-3xl border border-[#B2C5B2] p-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Spiritual Benefits */}
            <div>
              <h3 className="text-2xl font-bold text-[#003D33] mb-6 flex items-center gap-3">
                <FaLeaf className="text-[#C06014]" />
                Spiritual Benefits
              </h3>
              <div className="space-y-4">
                {[
                  "Enhances meditation and spiritual practice",
                  "Brings balance to your energy centers",
                  "Promotes emotional healing and clarity",
                  "Connects you with cosmic energies",
                  "Supports personal growth and transformation"
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-[#C06014] rounded-full flex items-center justify-center flex-shrink-0">
                      <FaSun className="text-white text-xs" />
                    </div>
                    <span className="text-[#00695C]">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Care Instructions */}
            <div>
              <h3 className="text-2xl font-bold text-[#003D33] mb-6 flex items-center gap-3">
                <FaMountain className="text-[#C06014]" />
                Sacred Care Instructions
              </h3>
              <div className="space-y-4">
                {[
                  "Cleanse under moonlight monthly",
                  "Charge with positive intentions",
                  "Keep away from negative energies",
                  "Store in sacred space when not in use",
                  "Handle with respect and gratitude"
                ].map((instruction, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-[#00695C] rounded-full flex items-center justify-center flex-shrink-0">
                      <FaCheck className="text-white text-xs" />
                    </div>
                    <span className="text-[#00695C]">{instruction}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default ProductShowcasePage;