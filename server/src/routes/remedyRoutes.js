import express from "express";
import {
  createRemedy,
  updateRemedy,
  deleteRemedy,
  getAllRemedies,
  bookRemedy,
} from "../controllers/remedyController.js";
import { uploadImages } from "../utils/multer.js";
import { authMiddleware, onlyUser } from "../middleware/authMiddleware.js";



const router = express.Router();

router.get("/",  getAllRemedies);
router.post("/", uploadImages.single("image"), createRemedy);
router.put("/:id", uploadImages.single("image"), updateRemedy);
router.delete("/:id", deleteRemedy);
router.post("/book", authMiddleware, onlyUser, bookRemedy)

export default router;
