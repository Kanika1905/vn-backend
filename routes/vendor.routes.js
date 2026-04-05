import express from "express";
import {
  //loginVendor,
  //verifyOtp,
  getProfile,
  updateProfile,
  getProducts,
  placeOrder,
  getMyOrders,
} from "../controllers/vendor.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// // Auth
// router.post("/login", loginVendor);
// router.post("/verify-otp", verifyOtp);

// Profile (protected)
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);

// Products (protected)
router.get("/products", authMiddleware, getProducts);

// Orders (protected)
router.post("/orders", authMiddleware, placeOrder);
router.get("/orders", authMiddleware, getMyOrders);

export default router;