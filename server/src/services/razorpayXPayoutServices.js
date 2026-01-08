import axios from "axios";


export const razorpayX = axios.create({
  baseURL: "https://api.razorpay.com/v1",
  auth: {
    username: process.env.RAZORPAY_KEY || "rzp_test_RwXcLi65KXy3eV" ,
    password: process.env.RAZORPAY_SECRET || "QMecJwhjnGFqqSfRr1dcfieJ",
  },
  headers: {
    "Content-Type": "application/json",
  },
});




export const payoutToFundAccount = async ({
  fundAccountId,
  amount,
  referenceId,
  narration = "Order Payout",
}) => {
  return await razorpayX.post('/payouts',{
    account_number: process.env.RAZORPAYX_ACCOUNT_NUMBER, // admin virtual account
    fund_account_id: fundAccountId,
    amount: Math.round(amount * 100), // paise
    currency: "INR",
    mode: "IMPS", // or NEFT / UPI
    purpose: "payout",
    queue_if_low_balance: true,
    reference_id: referenceId,
    narration,
  });
};
