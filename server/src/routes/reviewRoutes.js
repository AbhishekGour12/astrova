import express from 'express';
import {
  submitReview,
  getAstrologerReviews,
  getUserReviews,
  canReviewService,
  getAstrologerReviewStats,
  updateReview,
  deleteReview,
  submitUserReview
} from '../controllers/reviewController.js';
import { authMiddleware, onlyUser } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/astrologer/:astrologerId', getAstrologerReviews);
router.get('/astrologer/:astrologerId/stats', getAstrologerReviewStats);

// User routes (protected)
router.post('/submit', authMiddleware, onlyUser, submitReview);
router.get('/user', authMiddleware, onlyUser, getUserReviews);
router.get('/check/:serviceType/:serviceId', authMiddleware, onlyUser, canReviewService);
router.put('/:reviewId', authMiddleware, onlyUser, updateReview);
router.delete('/:reviewId', authMiddleware, onlyUser, deleteReview);
router.post('/user/submit', authMiddleware, onlyUser, submitUserReview)
export default router;