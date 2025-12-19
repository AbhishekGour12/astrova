import express from 'express'
import { Signup, Login, userProfile, updateUser, deleteUser, user, requestotp } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import{getProductById, getProducts, getProductTypes } from '../controllers/productController.js';
import { getCarouselByPage } from '../controllers/carouselController.js';
const router = express.Router();

router.post('/register',  Signup);
router.post('/login',  Login);
router.get('/profile/:token', authMiddleware, userProfile);
router.put('/:id', authMiddleware, updateUser);
router.delete('/:id', authMiddleware, deleteUser);
router.get('/userfind/:phone', user);
router.put('/requestotp/:phone', requestotp);
router.get('/product/:id', getProductById);
router.get("/product/type", getProductTypes);
router.get("/carousel", getCarouselByPage)

// ✅ Get all products
router.get("/product", getProducts);


export default router;