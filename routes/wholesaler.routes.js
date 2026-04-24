
// import express from "express";
// import {
//   addProduct,
//   getMyProducts,
//   updateProduct,
//   deleteProduct,
//   completeProfile,
//   getWholesalerProfile,
//   updateProfile
// } from "../controllers/wholesaler.controller.js";

// import { upload } from "../config/cloudinary.js"; 

// import authMiddleware from "../middleware/auth.middleware.js";

// const router = express.Router();

// // Profile
// router.put("/complete-profile", authMiddleware, completeProfile);
// router.get("/profile", authMiddleware, getWholesalerProfile);
// router.put("/update-profile", authMiddleware, updateProfile);

// // Products — all protected
// router.post("/products", authMiddleware, upload.array("images", 3), addProduct);
// router.get("/products", authMiddleware, getMyProducts);
// router.put("/products/:productId", authMiddleware, updateProduct);
// router.delete("/products/:productId", authMiddleware, deleteProduct);

// export default router;

import express from "express";
import {
  addProduct,
  getMyProducts,
  updateMyProduct,
  deleteMyProduct,
  completeProfile,
  getWholesalerProfile,
  updateProfile,
  getIncomingOrders,
  updateOrderStatus
} from "../controllers/wholesaler.controller.js";
import { upload } from "../config/cloudinary.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// ── Profile ──────────────────────────────────────────────────
router.get("/profile",          authMiddleware, getWholesalerProfile);
router.put("/complete-profile", authMiddleware, completeProfile);
router.put("/update-profile",   authMiddleware, updateProfile);

// ── Wholesaler's own products ─────────────────────────────────
router.post(  "/products",            authMiddleware, upload.array("images", 3), addProduct);
router.get(   "/products",            authMiddleware, getMyProducts);
router.put(   "/products/:productId", authMiddleware, updateMyProduct);
router.delete("/products/:productId", authMiddleware, deleteMyProduct);

router.get("/orders", authMiddleware, getIncomingOrders);
router.put("/orders/:orderId/status", authMiddleware, updateOrderStatus);
export default router;