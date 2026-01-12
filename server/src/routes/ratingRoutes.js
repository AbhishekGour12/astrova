import express from 'express';
import { 
  submitRating, 
  getProductRatings, 
  getUserRating, 
  getProductReviews,
  getHighRatedAstrologerReviews
} from '../controllers/ratingController.js';
import { authMiddleware, onlyUser } from '../middleware/authMiddleware.js';


const router = express.Router();

router.route('/product/:productId')
  .get(getProductRatings)
  .post(authMiddleware, onlyUser, submitRating);

router.route('/user/:productId')
  .get(authMiddleware, onlyUser, getUserRating);
router.route("/reviews").get(getProductReviews)
router.route("/astrologer-reviews").get(getHighRatedAstrologerReviews)
export default router;