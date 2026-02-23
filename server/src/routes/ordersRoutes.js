import express from 'express';
import { 
  createOrder, 
  getOrders, 
  getOrderById
} from '../controllers/orderController.js';
import { authMiddleware, onlyUser } from '../middleware/authMiddleware.js';

const router = express.Router();



router.post('/', createOrder);
router.get("/", authMiddleware, onlyUser, getOrders);

router.get('/:id', authMiddleware, onlyUser, getOrderById);
  
  
export default router;