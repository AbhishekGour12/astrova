// routes/contactRoutes.js
import express from "express";
import {
  submitContactForm,
  getAllContacts,
  getContactById,
  updateContactStatus,
  deleteContact
} from "../controllers/contactController.js";
import { authMiddleware, onlyUser } from "../middleware/authMiddleware.js";



const router = express.Router();

// Public routes
router.post("/submit", authMiddleware, onlyUser, submitContactForm);

// Protected admin routes
router.get("/all",  getAllContacts);
router.get("/:id",  getContactById);
router.put("/:id/status",  updateContactStatus);
router.delete("/:id",  deleteContact);

export default router;