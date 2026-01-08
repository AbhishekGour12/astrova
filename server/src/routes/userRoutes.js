import express from 'express'
import { Signup, Login, userProfile, deleteUser, user, requestotp, updateAstroProfile, getwalletBalance, addMoneyToWallet, meetRequest } from '../controllers/userController.js';
import { authMiddleware, onlyUser } from '../middleware/authMiddleware.js';
import{getProductById, getProducts, getProductTypes } from '../controllers/productController.js';
import { getCarouselByPage } from '../controllers/carouselController.js';
const router = express.Router();

router.post('/register',  Signup);
router.post('/login',  Login);
router.get('/profile/:token', authMiddleware, onlyUser, userProfile);
router.delete('/:id', authMiddleware, onlyUser, deleteUser);
router.get('/userfind/:phone', user);
router.put('/requestotp/:phone', requestotp);
router.get('/product/:id', getProductById);
router.get("/product/type", getProductTypes);
router.get("/carousel", getCarouselByPage)
router.put("/astro-profile", authMiddleware, onlyUser, updateAstroProfile)
router.get('/wallet', authMiddleware, onlyUser, getwalletBalance)
router.post("/addMoneyToWallet", authMiddleware, onlyUser, addMoneyToWallet)
router.post("/meet-request", meetRequest  )
// ✅ Get all products
router.get("/product", getProducts);


export default router;