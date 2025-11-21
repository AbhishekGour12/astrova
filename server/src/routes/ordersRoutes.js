import express from 'express';
import { 
  createOrder, 
  getOrders, 
  getOrderById
} from '../controllers/orderController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.route('/')
  .get(getOrders)
  .post(createOrder);

router.route('/:id')
  .get(getOrderById)
  
export default router;