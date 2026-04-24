// models/category.model.js
import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name:        { type: String, required: true, unique: true },
  description: { type: String },
  group:       { type: String },   // ← add this
  emoji:       { type: String },   // ← add this
}, { timestamps: true });

export const Category = mongoose.model("Category", categorySchema);