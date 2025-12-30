import express from 'express';
import { 
  getUserInterests, 
  addUserInterest, 
  removeUserInterest, 
  checkUserInterest, 
  getProductLikesCount
} from '../controllers/intrestedController.js';
import { authMiddleware, onlyUser } from '../middleware/authMiddleware.js';


const router = express.Router();

router.use(authMiddleware, onlyUser);

router.route('/')
  .get(getUserInterests)
  .post(addUserInterest);

router.route('/:productId')
  .get(checkUserInterest)
  .delete(removeUserInterest);
router.route('/likeCount/:productId').get(getProductLikesCount)
export default router;