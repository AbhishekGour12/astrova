"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { productAPI } from "../lib/product";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const user = useSelector((state) => state.auth.user);

  const fetchCart = async () => {
    if (!user) return setCartItems([]);

    try {
      const res = await productAPI.getCart();
      setCartItems(res?.cart?.items || []);
    } catch (err) {
      console.error("Cart fetch error:", err);
      setCartItems([]);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (productId, quantity) => {
    try {
      const res = await productAPI.addToCart(productId, quantity);
      setCartItems(res?.cart?.items || []);
      setIsCartOpen(true);
      toast.success("Added to cart!");
    } catch (err) {
      toast.error(err?.message || "Failed to add item");
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      const res = await productAPI.updateCartItem(itemId, quantity);
      setCartItems(res?.cart?.items || []);
    } catch (err) {
      toast.error(err?.message || "Failed to update cart");
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      console.log(itemId)
      const res = await productAPI.removeFromCart(itemId);
      setCartItems(res?.cart?.items || []);
      toast.success("Removed item");
    } catch (err) {
      toast.error(err?.message || "Failed to remove cart item");
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        fetchCart,
        isCartOpen,
        setIsCartOpen
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
