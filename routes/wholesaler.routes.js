// import express from "express";
// import {
//   addProduct,
//   getMyProducts,
//   updateProduct,
//   deleteProduct,
//   completeProfile,
//   getWholesalerProfile
// } from "../controllers/wholesaler.controller.js";

// import authMiddleware from "../middleware/auth.middleware.js";

// const router = express.Router();

// router.put("/complete-profile",  authMiddleware, completeProfile);

// router.post("/products",  addProduct);
// router.get("/products",  getMyProducts);
// router.put("/products/:productId",  updateProduct);
// router.delete("/products/:productId",  deleteProduct);
// router.get("/profile", authMiddleware, getWholesalerProfile);
// export default router;
import express from "express";
import {
  addProduct,
  getMyProducts,
  updateProduct,
  deleteProduct,
  completeProfile,
  getWholesalerProfile,
} from "../controllers/wholesaler.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// Profile
router.put("/complete-profile", authMiddleware, completeProfile);
router.get("/profile", authMiddleware, getWholesalerProfile);

// Products — all protected
router.post("/products", authMiddleware, addProduct);
router.get("/products", authMiddleware, getMyProducts);
router.put("/products/:productId", authMiddleware, updateProduct);
router.delete("/products/:productId", authMiddleware, deleteProduct);

export default router;