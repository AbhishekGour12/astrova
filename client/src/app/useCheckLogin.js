"use client";

import { useSelector } from "react-redux";
import toast from "react-hot-toast";

export default function useCheckLogin() {
  const user = useSelector((state) => state.auth.user);

  const checkLogin = () => {
    const token = localStorage.getItem("token");

    if (!user && !token) {
      toast.error("Please login first!");
      return false;
    }
    return true;
  };

  return checkLogin;
}
