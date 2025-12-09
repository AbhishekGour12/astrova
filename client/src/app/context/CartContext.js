"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { productAPI } from "../lib/product";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]); // unified cart format
  const [isCartOpen, setIsCartOpen] = useState(false);

  const user = useSelector((state) => state.auth.user);

  // ---------------------------------------------------------
  // UTIL: Save & Load guest cart from localStorage
  // ---------------------------------------------------------
  const loadGuestCart = () => {
    try {
      const local = JSON.parse(localStorage.getItem("guest_cart")) || [];
      return Array.isArray(local) ? local : [];
    } catch {
      return [];
    }
  };

  const saveGuestCart = (cart) => {
    localStorage.setItem("guest_cart", JSON.stringify(cart));
  };

  // ---------------------------------------------------------
  // FETCH CART  (AUTO: Guest + User)
  // ---------------------------------------------------------
  const fetchCart = async () => {
    if (!user) {
      // GUEST CART
      setCartItems(loadGuestCart());
      return;
    }

    try {
      // USER CART
      const res = await productAPI.getCart();
      const serverCart = res?.cart?.items || [];
      setCartItems(serverCart);

      // MERGE GUEST CART INTO USER CART IF EXISTS
      const guestCart = loadGuestCart();
      if (guestCart.length > 0) {
        for (let g of guestCart) {
          await productAPI.addToCart(g.productId, g.quantity);
        }
        localStorage.removeItem("guest_cart");
        fetchCart(); // refresh after sync
      }
    } catch (err) {
      console.error("Cart fetch error:", err);
      setCartItems([]);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  // ---------------------------------------------------------
  // ADD TO CART (Guest & User both)
  // ---------------------------------------------------------
  const addToCart = async (productId, quantity = 1) => {
    try {
      if (!user) {
        // GUEST CART MODE
        let cart = loadGuestCart();

        const exists = cart.find((item) => item.productId === productId);

        if (exists) {
          exists.quantity += quantity;
        } else {
          cart.push({ productId, quantity });
        }

        saveGuestCart(cart);
        setCartItems(cart);
        setIsCartOpen(true);

        return toast.success("Added to cart!");
      }

      // USER CART MODE
      const res = await productAPI.addToCart(productId, quantity);
      setCartItems(res?.cart?.items || []);
      setIsCartOpen(true);

      toast.success("Added to cart!");
    } catch (err) {
      toast.error(err?.message || "Failed to add item");
    }
  };

  // ---------------------------------------------------------
  // UPDATE QUANTITY (Guest & User)
  // ---------------------------------------------------------
  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) return removeFromCart(productId);

    try {
      if (!user) {
        let cart = loadGuestCart();
        cart = cart.map((item) =>
          item.productId === productId ? { ...item, quantity } : item
        );

        saveGuestCart(cart);
        setCartItems(cart);
        return;
      }

      const res = await productAPI.updateCartItem(productId, quantity);
      setCartItems(res?.cart?.items || []);
    } catch (err) {
      toast.error(err?.message || "Failed to update cart item");
    }
  };

  // ---------------------------------------------------------
  // REMOVE FROM CART (Guest & User)
  // ---------------------------------------------------------
  const removeFromCart = async (productId) => {
    try {
      if (!user) {
        let cart = loadGuestCart().filter((i) => i.productId !== productId);
        saveGuestCart(cart);
        setCartItems(cart);
        toast.success("Item removed");
        return;
      }

      const res = await productAPI.removeFromCart(productId);
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
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
