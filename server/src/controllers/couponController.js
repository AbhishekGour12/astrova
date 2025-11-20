import Coupon from "../models/Coupon.js";




export const applyCoupon = async (req, res) => {
  try {
    const { code, subtotal } = req.body;

    if (!code || !subtotal) {
      return res.status(400).json({ message: "Code and subtotal are required" });
    }

    // Convert to uppercase for safe search
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return res.status(404).json({ message: "Invalid coupon code" });
    }

    // Check coupon active status
    if (!coupon.active) {
      return res.status(400).json({ message: "This coupon is inactive" });
    }

    // Check expiry
    if (new Date(coupon.expiresAt) < new Date()) {
      return res.status(400).json({ message: "Coupon has expired" });
    }

    // Check minimum amount
    if (subtotal < coupon.minAmount) {
      return res.status(400).json({
        message: `Minimum order amount required is ₹${coupon.minAmount}`,
      });
    }

    let discount = 0;

    // Calculate based on type
    if (coupon.discountType === "percentage") {
      discount = (subtotal * coupon.discountValue) / 100;

      if (coupon.maxDiscount > 0 && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else if (coupon.discountType === "flat") {
      discount = coupon.discountValue;
    }

    const finalAmount = subtotal - discount;

    return res.json({
      success: true,
      message: "Coupon applied successfully",
      discount,
      finalAmount,
      coupon,
    });

  } catch (err) {
    console.log("Coupon Error:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};



// -----------------------------------------------------
// CREATE COUPON
// -----------------------------------------------------
export const createCoupon = async (req, res) => {
  try {
    const data = req.body;
   

    const obj = {
        discountType: data.discountType,
        discountValue: data.discountValue,
        minAmount: data.minAmount,
        maxDiscount: data.maxDiscount,
        expiresAt: data.expiresAt,
        active: data.active
    }

    // prevent same code twice
    const existing = await Coupon.findOne({ code: data.code.toUpperCase() });
    console.log(existing)
    if (existing) {
      return res.status(400).json({ message: "Coupon code already exists" });
    }

    const coupon = await Coupon.create({
      ...obj,
      code: data.code.toUpperCase(),
    });

    return res.status(201).json({
      message: "Coupon created successfully",
      coupon,
    });
  } catch (err) {
    console.log(err.message)
    res.status(500).json({ message: "Error creating coupon", error: err.message });
  }
};

// -----------------------------------------------------
// GET ALL COUPONS
// -----------------------------------------------------
export const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ coupons });
  } catch (err) {
    res.status(500).json({ message: "Error fetching coupons", error: err.message });
  }
};

// -----------------------------------------------------
// GET SINGLE COUPON
// -----------------------------------------------------
export const getCouponById = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });

    res.json({ coupon });
  } catch (err) {
    res.status(500).json({ message: "Error fetching coupon", error: err.message });
  }
};

// -----------------------------------------------------
// UPDATE COUPON
// -----------------------------------------------------
export const updateCoupon = async (req, res) => {
  try {
    const data = req.body;

    if (data.code) data.code = data.code.toUpperCase();

    const updated = await Coupon.findByIdAndUpdate(
      req.params.id,
      data,
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Coupon not found" });

    res.json({
      message: "Coupon updated successfully",
      coupon: updated,
    });

  } catch (err) {
    res.status(500).json({ message: "Error updating coupon", error: err.message });
  }
};

// -----------------------------------------------------
// DELETE COUPON
// -----------------------------------------------------
export const deleteCoupon = async (req, res) => {
  try {
    const deleted = await Coupon.findByIdAndDelete(req.params.id);

    if (!deleted) return res.status(404).json({ message: "Coupon not found" });

    res.json({ message: "Coupon deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting coupon", error: err.message });
  }
};

// -----------------------------------------------------
// TOGGLE ACTIVE / INACTIVE
// -----------------------------------------------------
export const toggleCouponStatus = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) return res.status(404).json({ message: "Coupon not found" });

    coupon.active = !coupon.active;
    await coupon.save();

    res.json({
      message: `Coupon ${coupon.active ? "activated" : "deactivated"}`,
      coupon,
    });
  } catch (err) {
    res.status(500).json({ message: "Error updating status", error: err.message });
  }
};

// -----------------------------------------------------
// VALIDATE / APPLY COUPON
// (Use this in checkout)
// -----------------------------------------------------
export const validateCoupon = async (req, res) => {
  try {
    const { code, subtotal } = req.body;

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return res.status(404).json({ message: "Invalid coupon code" });
    }

    // Check active
    if (!coupon.active) {
      return res.status(400).json({ message: "Coupon is inactive" });
    }

    // Check expiry
    if (new Date(coupon.expiresAt) < new Date()) {
      return res.status(400).json({ message: "Coupon has expired" });
    }

    // Check minimum amount
    if (subtotal < coupon.minAmount) {
      return res.status(400).json({
        message: `Minimum order amount required is ₹${coupon.minAmount}`,
      });
    }

    let discount = 0;

    if (coupon.discountType === "percentage") {
      discount = (subtotal * coupon.discountValue) / 100;

      if (coupon.maxDiscount > 0 && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.discountValue;
    }

    const finalAmount = subtotal - discount;

    res.json({
      message: "Coupon applied successfully",
      discount,
      finalAmount,
      coupon,
    });

  } catch (err) {
    res.status(500).json({ message: "Error validating coupon", error: err.message });
  }
};
