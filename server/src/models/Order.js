import mongoose from "mongoose";





const OrderSchema = new mongoose.Schema({
    userId: { type: String, required: true, ref: 'User' },
    products: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: Number,
      },
    ],
    totalAmount: { type: Number, required: true },
    shippingAddress: { type: Object, required: true },
    paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Pending' },
    deliveryStatus: { type: String, enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'], default: 'Processing' },
    createdAt: { type: Date, default: Date.now }
});


const Order = mongoose.model("Order", OrderSchema);

export default Order;
