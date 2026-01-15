import Review from '../models/Review.js';
import Chat from '../models/Chat.js';
import Call from '../models/Call.js';
import Astrologer from '../models/Astrologer.js';

/* ======================================================
   SUBMIT REVIEW
====================================================== */
export const submitReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { serviceId, serviceType, rating, comment } = req.body;

    // Validate service type
    if (!['CHAT', 'CALL'].includes(serviceType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid service type. Must be CHAT or CALL"
      });
    }

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5"
      });
    }

    // Check if service exists
    let service;
    let astrologerId;

    if (serviceType === 'CHAT') {
      service = await Chat.findById(serviceId).populate('astrologer', '_id');
      if (!service) {
        return res.status(404).json({
          success: false,
          message: "Chat not found"
        });
      }
      astrologerId = service.astrologer._id;
      
      // Check if user participated in this chat
      if (String(service.user) !== userId) {
        return res.status(403).json({
          success: false,
          message: "You can only review chats you participated in"
        });
      }

      // Check if chat is ended
      if (service.status !== 'ENDED') {
        return res.status(400).json({
          success: false,
          message: "You can only review ended chats"
        });
      }
    } else if (serviceType === 'CALL') {
      service = await Call.findById(serviceId).populate('astrologer', '_id');
      if (!service) {
        return res.status(404).json({
          success: false,
          message: "Call not found"
        });
      }
      astrologerId = service.astrologer._id;
      
      // Check if user participated in this call
      if (String(service.user) !== userId) {
        return res.status(403).json({
          success: false,
          message: "You can only review calls you participated in"
        });
      }

      // Check if call is ended
      if (service.status !== 'ENDED') {
        return res.status(400).json({
          success: false,
          message: "You can only review ended calls"
        });
      }
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      user: userId,
      serviceId: serviceId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this service"
      });
    }

    // Create review
    const review = await Review.create({
      user: userId,
      astrologer: astrologerId,
      serviceType,
      serviceId,
      rating: parseInt(rating),
      comment: comment?.trim()
    });

    // Update astrologer's average rating
    await updateAstrologerRating(astrologerId);

    res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      review
    });
  } catch (err) {
    console.error("Submit review error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to submit review"
    });
  }
};

/* ======================================================
   GET REVIEWS FOR ASTROLOGER
====================================================== */
export const getAstrologerReviews = async (req, res) => {
  try {
    const { astrologerId } = req.params;
   
   

    
    

    const reviews = await Review.find({astrologer: astrologerId})
      .populate('user', 'username ')
      
   

   

   

    res.json({
      success: true,
      reviews
     
      
    });
  } catch (err) {
    console.log("Get reviews error:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to get reviews"
    });
  }
};

/* ======================================================
   GET USER REVIEWS
====================================================== */
export const getUserReviews = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await Review.find({ user: userId, isActive: true })
      .populate('astrologer', 'fullName profileImageUrl')
      .populate('serviceId', 'createdAt endedAt totalAmount')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const totalReviews = await Review.countDocuments({ user: userId, isActive: true });

    res.json({
      success: true,
      reviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalReviews / parseInt(limit)),
        totalReviews
      }
    });
  } catch (err) {
    console.error("Get user reviews error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to get reviews"
    });
  }
};

/* ======================================================
   CHECK IF USER CAN REVIEW SERVICE
====================================================== */
export const canReviewService = async (req, res) => {
  try {
    const userId = req.user.id;
    const { serviceId, serviceType } = req.params;

    // Check if service exists and user participated
    let service;
    if (serviceType === 'CHAT') {
      service = await Chat.findById(serviceId);
    } else if (serviceType === 'CALL') {
      service = await Call.findById(serviceId);
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid service type"
      });
    }

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found"
      });
    }

    // Check if user participated
    if (String(service.user) !== userId) {
      return res.json({
        success: true,
        canReview: false,
        reason: "You did not participate in this service"
      });
    }

    // Check if service is ended
    if (service.status !== 'ENDED') {
      return res.json({
        success: true,
        canReview: false,
        reason: "Service is still active"
      });
    }

    // Check if already reviewed
    const existingReview = await Review.findOne({
      user: userId,
      serviceId: serviceId
    });

    if (existingReview) {
      return res.json({
        success: true,
        canReview: false,
        reason: "Already reviewed",
        existingReview
      });
    }

    // Check if service ended within last 7 days (optional time limit)
    const endedAt = service.endedAt || service.updatedAt;
    const daysSinceEnded = (Date.now() - new Date(endedAt).getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceEnded > 7) {
      return res.json({
        success: true,
        canReview: false,
        reason: "Review period expired (7 days)"
      });
    }

    res.json({
      success: true,
      canReview: true,
      service: {
        id: service._id,
        type: serviceType,
        astrologer: service.astrologer,
        endedAt: service.endedAt
      }
    });
  } catch (err) {
    console.error("Check review error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to check review eligibility"
    });
  }
};

/* ======================================================
   GET REVIEW STATISTICS FOR ASTROLOGER
====================================================== */
export const getAstrologerReviewStats = async (req, res) => {
  try {
    const { astrologerId } = req.params;

    // Get rating distribution
    const distribution = await Review.aggregate([
      { $match: { astrologer: mongoose.Types.ObjectId(astrologerId), isActive: true } },
      { $group: { _id: "$rating", count: { $sum: 1 } } },
      { $sort: { _id: -1 } }
    ]);

    // Get average ratings by service type
    const serviceTypeStats = await Review.aggregate([
      { $match: { astrologer: mongoose.Types.ObjectId(astrologerId), isActive: true } },
      { $group: { _id: "$serviceType", averageRating: { $avg: "$rating" }, count: { $sum: 1 } } }
    ]);

    // Get recent reviews count (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentReviews = await Review.countDocuments({
      astrologer: astrologerId,
      isActive: true,
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Format distribution
    const ratingDistribution = {};
    for (let i = 1; i <= 5; i++) {
      ratingDistribution[i] = 0;
    }
    distribution.forEach(item => {
      ratingDistribution[item._id] = item.count;
    });

    res.json({
      success: true,
      stats: {
        ratingDistribution,
        serviceTypeStats,
        recentReviews,
        totalReviews: distribution.reduce((sum, item) => sum + item.count, 0)
      }
    });
  } catch (err) {
    console.error("Get review stats error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to get review statistics"
    });
  }
};

/* ======================================================
   UPDATE REVIEW
====================================================== */
export const updateReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found"
      });
    }

    // Check ownership
    if (String(review.user) !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own reviews"
      });
    }

    // Update review
    if (rating !== undefined) review.rating = parseInt(rating);
    if (comment !== undefined) review.comment = comment?.trim();
    
    await review.save();

    // Update astrologer's average rating
    await updateAstrologerRating(review.astrologer);

    res.json({
      success: true,
      message: "Review updated successfully",
      review
    });
  } catch (err) {
    console.error("Update review error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update review"
    });
  }
};

/* ======================================================
   DELETE REVIEW
====================================================== */
export const deleteReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found"
      });
    }

    // Check ownership
    if (String(review.user) !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own reviews"
      });
    }

    // Soft delete
    review.isActive = false;
    await review.save();

    // Update astrologer's average rating
    await updateAstrologerRating(review.astrologer);

    res.json({
      success: true,
      message: "Review deleted successfully"
    });
  } catch (err) {
    console.error("Delete review error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to delete review"
    });
  }
};

/* ======================================================
   HELPER: UPDATE ASTROLOGER RATING
====================================================== */
const updateAstrologerRating = async (astrologerId) => {
  try {
    const result = await Review.aggregate([
      { $match: { astrologer: mongoose.Types.ObjectId(astrologerId), isActive: true } },
      { 
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
          fiveStar: { $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] } },
          fourStar: { $sum: { $cond: [{ $eq: ["$rating", 4] }, 1, 0] } },
          threeStar: { $sum: { $cond: [{ $eq: ["$rating", 3] }, 1, 0] } },
          twoStar: { $sum: { $cond: [{ $eq: ["$rating", 2] }, 1, 0] } },
          oneStar: { $sum: { $cond: [{ $eq: ["$rating", 1] }, 1, 0] } }
        }
      }
    ]);

    if (result.length > 0) {
      const stats = result[0];
      await Astrologer.findByIdAndUpdate(astrologerId, {
        'rating.average': Math.round(stats.averageRating * 10) / 10 || 0,
        'rating.totalReviews': stats.totalReviews || 0,
        'rating.breakdown': {
          fiveStar: stats.fiveStar || 0,
          fourStar: stats.fourStar || 0,
          threeStar: stats.threeStar || 0,
          twoStar: stats.twoStar || 0,
          oneStar: stats.oneStar || 0
        },
        'rating.lastUpdated': new Date()
      });
    }
  } catch (err) {
    console.error("Update astrologer rating error:", err);
  }
};


// Simplified backend API for direct astrologer review
export const submitUserReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { astrologerId, rating, comment } = req.body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5"
      });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      user: userId,
      astrologer: astrologerId
    });

    if (existingReview) {
      // Update existing review
      existingReview.rating = parseInt(rating);
      existingReview.comment = comment?.trim();
      await existingReview.save();
      
      await updateAstrologerRating(astrologerId);
      
      return res.json({
        success: true,
        message: "Review updated successfully",
        review: existingReview
      });
    }

    // Create new review
    const review = await Review.create({
      user: userId,
      astrologer: astrologerId,
      rating: parseInt(rating),
      comment: comment?.trim()
    });

    // Update astrologer's average rating
    await updateAstrologerRating(astrologerId);

    res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      review
    });
  } catch (err) {
    console.error("Submit review error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to submit review"
    });
  }
};