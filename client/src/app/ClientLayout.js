"use client";

import { usePathname } from "next/navigation";
import Navbar from "./components/Navbar";
import CartSlideOut from "./components/CartSlideOut";
import Footer from "./components/Footer";

export default function ClientLayout({ children }) {
  const pathname = usePathname();

  const hideNavbar = ["/Login", "/Signup", "/Astrologer/login", "/Astrologer/register", "/Astrologer"].includes(pathname);

  return (
    <>
      {!hideNavbar && <Navbar />}
      {!hideNavbar && <CartSlideOut />}

      {children}

      {!hideNavbar && <Footer />}
    </>
  );
}
