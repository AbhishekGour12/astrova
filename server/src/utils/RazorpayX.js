import axios from "axios";

const RazorpayX = axios.create({
  baseURL: "https://api.razorpay.com/v1",
  auth: {
    username: process.env.RAZORPAY_KEY || "rzp_test_RwXcLi65KXy3eV" ,
    password: process.env.RAZORPAY_SECRET || "QMecJwhjnGFqqSfRr1dcfieJ",
  },
  headers: {
    "Content-Type": "application/json",
  },
});

export default RazorpayX;
