import express from 'express'
import { Signup, Login, userProfile, deleteUser, user, requestotp, updateAstroProfile, getwalletBalance, addMoneyToWallet } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import{getProductById, getProducts, getProductTypes } from '../controllers/productController.js';
import { getCarouselByPage } from '../controllers/carouselController.js';
const router = express.Router();

router.post('/register',  Signup);
router.post('/login',  Login);
router.get('/profile/:token', authMiddleware, userProfile);
router.delete('/:id', authMiddleware, deleteUser);
router.get('/userfind/:phone', user);
router.put('/requestotp/:phone', requestotp);
router.get('/product/:id', getProductById);
router.get("/product/type", getProductTypes);
router.get("/carousel", getCarouselByPage)
router.put("/astro-profile", authMiddleware, updateAstroProfile)
router.get('/wallet', authMiddleware, getwalletBalance)
router.post("/addMoneyToWallet", authMiddleware, addMoneyToWallet)

// ✅ Get all products
router.get("/product", getProducts);


export default router;