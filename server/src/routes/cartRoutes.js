import express from 'express';
import { 
  getCart, 
  addToCart, 
  updateCartItem, 
  removeFromCart, 
  clearCart 
} from '../controllers/cartController.js';
import { authMiddleware, onlyUser } from '../middleware/authMiddleware.js';


const router = express.Router();

router.use(authMiddleware, onlyUser);

router.route('/')
  .get(getCart)
  .post(addToCart)
  .delete(clearCart);

router.route('/:itemId')
  .put(updateCartItem)
  .delete(removeFromCart);

export default router;