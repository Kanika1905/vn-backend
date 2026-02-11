// routes/index.js
import express from "express";
import authRoutes from "./auth.routes.js";
import categoryRoutes from "./category.routes.js";
import productRoutes from "./product.routes.js";
import wholesalerRoutes from "./wholesaler.routes.js";

const router = express.Router();

// Auth APIs
router.use("/auth", authRoutes);

// Categories APIs
router.use("/categories", categoryRoutes);

// (Optional / public products – keep only if needed)
router.use("/products", productRoutes);

// Wholesaler specific APIs (profile + my products)
router.use("/wholesaler", wholesalerRoutes);

export default router;
