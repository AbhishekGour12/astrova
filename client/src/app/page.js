"use client";
import Image from "next/image";
import dynamic from "next/dynamic";
import { motion, AnimatePresence, LazyMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
// Heavy Components (Lazy Load as user scrolls)
import About from './components/Home/About';
import Product from './components/Home/Product';
const BestProducts = dynamic(() => import('./components/Home/BestProducts'), { ssr: false });
const BookConsultant = dynamic(() => import('./components/Home/BookConsultant'), { ssr: false });
const AstrologerSection = dynamic(() => import('./components/Home/AstrologerSection'), { ssr: false });
const PremiumProductSection = dynamic(() => import('./components/Home/PremiumProductSection'), { ssr: false });
const Testimonial = dynamic(() => import('./components/Home/Testimonial'), { ssr: false });
import HeroSection from './components/Home/HeroSection';

import Navbar from './components/Navbar'

import { useSelector } from "react-redux";

import { productAPI } from "./lib/product";




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
      <HeroSection/>
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