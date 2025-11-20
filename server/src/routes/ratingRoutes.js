import express from 'express';
import { 
  submitRating, 
  getProductRatings, 
  getUserRating 
} from '../controllers/ratingController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';


const router = express.Router();

router.route('/product/:productId')
  .get(getProductRatings)
  .post(authMiddleware, submitRating);

router.route('/user/:productId')
  .get(authMiddleware, getUserRating);

export default router;