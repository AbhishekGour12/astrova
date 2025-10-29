import axios from "axios";




const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API,
   
})

api.interceptors.request.use(
    (cfg) => {
        const token = localStorage.getItem("token");
        if (token) {
            cfg.headers.Authorization = `Bearer ${token}`;
        }
        return cfg;
    },
    (error) => {
        return Promise.reject(error);
    }
)

api.interceptors.response.use(
    (response) => response,
    (error) =>{
        if (error.response && error.response.status === 401) {
            // Handle unauthorized access, e.g., redirect to login
            console.error("Unauthorized access - perhaps redirect to login?");
        }
        return Promise.reject(error);
    }
)

export default api;