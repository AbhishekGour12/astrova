import Cart from '../models/Cart.js';


export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    let cart = await Cart.findOne({ userId })
  .populate("items.product");

   if (cart) {
    cart.items = cart.items.filter(item => item.product !== null);
   }




    res.json({ cart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(userId)
    const { productId, quantity } = req.body;
console.log(productId, quantity)
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const item = cart.items.find(
      (i) => i.product.toString() === productId
    );

    if (item) {
      item.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();

    const populatedCart = await Cart.findOne({ userId })
      .populate("items.product");
     console.log(populatedCart)
    res.json({
      message: "Item added",
      cart: populatedCart
    });
  } catch (err) {
    console.log(err.message)
    res.status(500).json({ message: err.message });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!itemId) 
      return res.status(400).json({ message: "Missing itemId" });

    const q = Number(quantity);

    // -------------------------------------------
    // CASE 1 — If quantity = 0 → DELETE the item
    // -------------------------------------------
    if (q === 0) {
      const removed = await Cart.findOneAndUpdate(
        { userId, "items._id": itemId },
        { $pull: { items: { _id: itemId } } },
        { new: true }
      ).populate({ path: "items.product", select: "name price imageUrls" });

      // Fallback if frontend sent productId instead of itemId
      if (!removed) {
        const removedByProduct = await Cart.findOneAndUpdate(
          { userId, "items.product": itemId },
          { $pull: { items: { product: itemId } } },
          { new: true }
        ).populate({ path: "items.product", select: "name price imageUrls" });

        if (!removedByProduct) {
          return res.status(404).json({ message: "Item not found" });
        }

        return res.json({ cart: removedByProduct });
      }

      return res.json({ cart: removed });
    }

    // -------------------------------------------
    // CASE 2 — Update the quantity
    // -------------------------------------------
    const updated = await Cart.findOneAndUpdate(
      { userId, "items._id": itemId },
      { $set: { "items.$.quantity": q } },
      { new: true }
    ).populate({ path: "items.product", select: "name price imageUrls" });

    if (!updated) {
      // Maybe frontend sent productId instead of itemId
      const alt = await Cart.findOneAndUpdate(
        { userId, "items.product": itemId },
        { $set: { "items.$.quantity": q } },
        { new: true }
      ).populate({ path: "items.product", select: "name price imageUrls" });

      if (!alt) return res.status(404).json({ message: "Item not found" });
      return res.json({ cart: alt });
    }

    return res.json({ cart: updated });

  } catch (error) {
    console.error("updateCartItem error:", error);
    res.status(500).json({ message: error.message });
  }
};



export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params; // can be either itemId or productId
    console.log(itemId)
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    // Remove by item._id  OR by product._id
    cart.items = cart.items.filter(
      (item) =>
        item._id.toString() !== itemId &&
        item.product.toString() !== itemId
    );

    await cart.save();

    const populatedCart = await Cart.findOne({ userId }).populate(
      "items.product"
    );

    res.json({ cart: populatedCart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


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