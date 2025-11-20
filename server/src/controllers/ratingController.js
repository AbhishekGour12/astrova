import Rating from '../models/Rating.js';
import Product from '../models/Products.js';

export const submitRating = async (req, res) => {
  try {
    const { productId, rating, review } = req.body;
    
    // Check if user already rated this product
    let existingRating = await Rating.findOne({ 
      userId: req.user.id, 
      productId 
    });
    
    if (existingRating) {
      existingRating.rating = rating;
      existingRating.review = review;
      await existingRating.save();
    } else {
      existingRating = new Rating({
        userId: req.user.id,
        productId,
        rating,
        review
      });
      await existingRating.save();
    }
    
    // Update product average rating
    const ratings = await Rating.find({ productId });
    const averageRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
    
    await Product.findByIdAndUpdate(productId, {
      rating: averageRating,
      reviewCount: ratings.length
    });
    
    res.json({ message: 'Rating submitted successfully', rating: existingRating });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting rating', error: error.message });
  }
};

export const getProductRatings = async (req, res) => {
  try {
    const { productId } = req.params;
    
    const ratings = await Rating.find({ productId })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .exec();
    
    res.json(ratings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching ratings', error: error.message });
  }
};

export const getUserRating = async (req, res) => {
  try {
    const { productId } = req.params;
    
    const rating = await Rating.findOne({ 
      userId: req.user.id, 
      productId 
    });
    
    res.json(rating || null);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user rating', error: error.message });
  }
};