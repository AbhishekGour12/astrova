import express from 'express';
import { 
  submitRating, 
  getProductRatings, 
  getUserRating, 
  getProductReviews
} from '../controllers/ratingController.js';
import { authMiddleware, onlyUser } from '../middleware/authMiddleware.js';


const router = express.Router();

router.route('/product/:productId')
  .get(getProductRatings)
  .post(authMiddleware, onlyUser, submitRating);

router.route('/user/:productId')
  .get(authMiddleware, onlyUser, getUserRating);
router.route("/reviews").get(getProductReviews)
export default router;