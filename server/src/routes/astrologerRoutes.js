// routes/astrologer.routes.js
import express from "express";
import { astrologerLogin, getAllAstrologers, registerAstrologer } from "../controllers/astrologerController.js";

import { uploadImages } from "../utils/multer.js";


const router = express.Router();

router.post("/register", uploadImages.single("profileImage"), registerAstrologer);
router.post("/login", astrologerLogin);
router.get("/", getAllAstrologers)

export default router;
