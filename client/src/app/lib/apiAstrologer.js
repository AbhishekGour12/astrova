import axios from "axios";

const apiAstrologer = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API}/api`,
});

// Attach token in every request
apiAstrologer.interceptors.request.use((config) => {
  const token = localStorage.getItem("astrologer_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// MAIN PART — CHECK TOKEN EXPIRY
apiAstrologer.interceptors.response.use(
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
        localStorage.removeItem("astrologer_token");
        localStorage.removeItem("astrologer");

        // Redirect to login pagewindow.location.href = "/Login";
      }
    }

    return Promise.reject(error);
  }
);

export default apiAstrologer;