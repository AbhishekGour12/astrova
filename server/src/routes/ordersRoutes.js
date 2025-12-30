import express from 'express';
import { 
  createOrder, 
  getOrders, 
  getOrderById
} from '../controllers/orderController.js';
import { authMiddleware, onlyUser } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware, onlyUser);

router.route('/')
  .get(getOrders)
  .post(createOrder);

router.route('/:id')
  .get(getOrderById)
  
export default router;