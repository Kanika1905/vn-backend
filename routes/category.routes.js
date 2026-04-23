import express from "express";
import { Category } from "../models/category.model.js";

const router = express.Router();

// GET /categories  — public, no auth needed
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find().select("_id name description").sort("name");
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;