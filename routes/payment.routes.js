import express from "express";
import {
  createRazorpayOrder,
  verifySignature,
  attachPaymentToOrder,
} from "../controllers/payment.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// Create a Razorpay order (called before opening checkout)
router.post("/create-order", authMiddleware, createRazorpayOrder);

// Pure signature check, called right after RazorpayCheckout.open() resolves
router.post("/verify", authMiddleware, verifySignature);

// Attach confirmed payment to a real Order document, called after the
// vendor.controller.js placeOrder calls have actually created the orders
router.post("/attach", authMiddleware, attachPaymentToOrder);

export default router;