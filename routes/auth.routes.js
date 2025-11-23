import express from "express";
import { 
  loginVendor, 
  verifyVendorOTP, 
  loginWholesaler, 
  verifyWholesalerOTP 
} from "../controllers/auth.controller.js";

const router = express.Router();

// Vendor routes
router.post("/vendor/login", loginVendor);
router.post("/vendor/verify", verifyVendorOTP);

// Wholesaler routes
router.post("/wholesaler/login", loginWholesaler);
router.post("/wholesaler/verify", verifyWholesalerOTP);

export default router;
