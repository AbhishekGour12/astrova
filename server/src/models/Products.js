import mongoose from "mongoose";






const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    category: { type: String }, 
    imageUrls: { type: [String] },
    isFeatured: { type: Boolean, default: false },
});


const Product = mongoose.model("product", ProductSchema);

export default Product;