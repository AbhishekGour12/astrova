"use client";

import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function useCheckLogin() {
  const user = useSelector((state) => state.auth.user);
  const router = useRouter();
  const checkLogin = () => {
    const token = localStorage.getItem("token");

    if (!user && !token) {
      toast.error("Please login first!");
      router.push("/Login")
      return false;
    }
    return true;
  };

  return checkLogin;
}
