// routes/tracking.routes.js
import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { updateLocation, getTrack } from "../controllers/tracking.controller.js";

const router = express.Router();

// Both endpoints are protected by the existing Bearer-token auth.
router.post("/:orderId/location", authMiddleware, updateLocation);
router.get("/:orderId/track", authMiddleware, getTrack);

export default router;
