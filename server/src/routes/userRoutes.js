import express from 'express'
import { Signup, Login, userProfile, updateUser, deleteUser, user, requestotp } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
const router = express.Router();

router.post('/register',  Signup);
router.post('/login',  Login);
router.get('/profile', authMiddleware, userProfile);
router.put('/:id', authMiddleware, updateUser);
router.delete('/:id', authMiddleware, deleteUser);
router.get('/userfind/:phone', user);
router.put('/requestotp/:phone', requestotp);


export default router;