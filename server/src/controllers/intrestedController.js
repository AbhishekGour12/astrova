import UserInterest from '../models/Interest.js';
import Product from '../models/Products.js'

export const getUserInterests = async (req, res) => {
  try {
    const interests = await UserInterest.find({ userId: req.user.id })
      .populate('productId')
      .exec();
    
    res.json(interests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching interests', error: error.message });
  }
};


export const addUserInterest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    // Try to find existing doc
    let interest = await UserInterest.findOne({ userId, productId });
    
    if (!interest) {
      // Create new interest (initial likeCount = 1)
      interest = await UserInterest.create({
        userId,
        productId,
        isLiked: true,
        
      });

      return res.json({ isLiked: true });
    }

    // If already exists and isLiked is true, don't increment again
    if (interest.isLiked) {
      return res.status(200).json({ message: "Already liked", isLiked: true });
    }

    // If exists but not liked, mark liked and increment
    interest.isLiked = true;
    await interest.save();

    res.json({ isLiked: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to like product" });
  }
};



export const removeUserInterest = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;
   

    const doc = await UserInterest.findOneAndUpdate(
      { userId, productId },
      { isLiked: false },
      { new: true }
    );

    res.json({ isLiked: false });
  } catch (error) {
    res.status(500).json({ message: "Failed to unlike product" });
  }
};


export const checkUserInterest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
   

    const interest = await UserInterest.findOne({ userId, productId });

    res.json({
      isLiked: interest?.isLiked || false,
    });

  } catch (error) {
    res.status(500).json({ message: "Failed to check interest" });
  }
};
export const getProductLikesCount = async (req, res) => {
  const { productId } = req.params;

  const count = await UserInterest.countDocuments({
    productId,
    isLiked: true,
  });

  res.json({ count });
};

