import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API
    ? `${process.env.NEXT_PUBLIC_API}/api`
    : "https://api.myastrova.com/api",
});

// Attach token in every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
  
});

// MAIN PART — CHECK TOKEN EXPIRY
api.interceptors.response.use(
  (response) => response,
  
  (error) => {
    // If token expired
    if (error.response && error.response.status === 401) {
      const message = error.response.data?.message || "";

      if (
        message.includes("expired") ||
        message.includes("invalid token") ||
        message.includes("jwt") ||
        message.includes("Token") ||
        error.response.status === 401
      ) {
        //toast.error("Session expired. Please login again.");

        // CLEAR USER + TOKEN
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // Redirect to login pagewindow.location.href = "/Login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
