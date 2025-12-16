"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function PathLayout({ children }) {
  const pathname = usePathname();

  useEffect(() => {
    let formatted = pathname === "/" ? "Home" : pathname.replace("/", "");
    formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);

    document.title = `MyAstrova | ${formatted}`;
  }, [pathname]);

  return children;
}
