import express from "express";
import {
  createRazorpayOrder,
  verifyPayment,
} from "../controllers/payment.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// Create a Razorpay order (called before opening checkout)
router.post("/create-order", authMiddleware, createRazorpayOrder);

// Verify payment signature after checkout completes
router.post("/verify", authMiddleware, verifyPayment);

export default router;