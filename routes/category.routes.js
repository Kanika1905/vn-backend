import express from "express";
import { Category } from "../models/category.model.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const categories = await Category.find().sort({ group: 1, name: 1 });
  res.json({ categories });
});

export default router;