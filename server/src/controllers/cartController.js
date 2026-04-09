import Cart from '../models/Cart.js';
import Product from '../models/Products.js'; // 👈 Import Product model
import mongoose from 'mongoose';

// Helper: resolve product identifier (id or slug) to ObjectId
const resolveProductId = async (identifier) => {
  // If it's already a valid ObjectId, return it
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    return identifier;
  }
  // Otherwise treat as slug and find product
  const product = await Product.findOne({ slug: identifier }).select('_id');
  if (!product) throw new Error(`Product not found for slug: ${identifier}`);
  return product._id;
};

export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    let { productId, quantity } = req.body;

    // ✅ Resolve product identifier to actual ObjectId
    const resolvedProductId = await resolveProductId(productId);

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const item = cart.items.find(
      (i) => i.product.toString() === resolvedProductId.toString()
    );

    if (item) {
      item.quantity += quantity;
    } else {
      cart.items.push({ product: resolvedProductId, quantity });
    }

    await cart.save();

    const populatedCart = await Cart.findOne({ userId })
      .populate("items.product");

    res.json({
      message: "Item added",
      cart: populatedCart
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: err.message });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    let { itemId } = req.params;
    const { quantity } = req.body;

    if (!itemId) 
      return res.status(400).json({ message: "Missing itemId" });

    const q = Number(quantity);

    // Helper to handle update by either item._id or product._id (slug or id)
    const updateCart = async (filter) => {
      if (q === 0) {
        // Remove item
        return await Cart.findOneAndUpdate(
          { userId, ...filter },
          { $pull: { items: filter } },
          { new: true }
        ).populate({ path: "items.product", select: "name price imageUrls" });
      } else {
        // Update quantity
        return await Cart.findOneAndUpdate(
          { userId, ...filter },
          { $set: { "items.$.quantity": q } },
          { new: true }
        ).populate({ path: "items.product", select: "name price imageUrls" });
      }
    };

    let updatedCart;

    // Try treating itemId as item._id first
    if (mongoose.Types.ObjectId.isValid(itemId)) {
      updatedCart = await updateCart({ "items._id": itemId });
      if (updatedCart) return res.json({ cart: updatedCart });
    }

    // If not found, treat itemId as product slug or product ID
    let productObjectId;
    if (mongoose.Types.ObjectId.isValid(itemId)) {
      productObjectId = itemId;
    } else {
      const product = await Product.findOne({ slug: itemId }).select('_id');
      if (product) productObjectId = product._id;
    }

    if (productObjectId) {
      if (q === 0) {
        updatedCart = await Cart.findOneAndUpdate(
          { userId },
          { $pull: { items: { product: productObjectId } } },
          { new: true }
        ).populate("items.product");
      } else {
        updatedCart = await Cart.findOneAndUpdate(
          { userId, "items.product": productObjectId },
          { $set: { "items.$.quantity": q } },
          { new: true }
        ).populate("items.product");
      }
    }

    if (!updatedCart) {
      return res.status(404).json({ message: "Item not found" });
    }

    return res.json({ cart: updatedCart });
  } catch (error) {
    console.error("updateCartItem error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    let { itemId } = req.params;

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    // Resolve itemId to product ObjectId if it's a slug
    let productObjectId = null;
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      const product = await Product.findOne({ slug: itemId }).select('_id');
      if (product) productObjectId = product._id;
    }

    // Filter out items matching either item._id or product._id (resolved)
    cart.items = cart.items.filter((item) => {
      const matchesItemId = item._id.toString() === itemId;
      const matchesProductId = productObjectId 
        ? item.product.toString() === productObjectId.toString()
        : item.product.toString() === itemId;
      return !matchesItemId && !matchesProductId;
    });

    await cart.save();

    const populatedCart = await Cart.findOne({ userId }).populate("items.product");
    res.json({ cart: populatedCart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// clearCart remains unchanged
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    cart.items = [];
    await cart.save();
    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error clearing cart', error: error.message });
  }
};

export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    let cart = await Cart.findOne({ userId }).populate("items.product");
    if (cart) {
      // Remove items where product was deleted
      const validItems = cart.items.filter(item => item.product !== null);
      if (validItems.length !== cart.items.length) {
        cart.items = validItems;
        await cart.save();
      }
    }
    res.json({ cart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};