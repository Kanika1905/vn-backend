// models/category.model.js
import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name:        { type: String, required: true, unique: true },
  description: { type: String },
  group:       { type: String },
  emoji:       { type: String },
  image:       { type: String },   // category image URL
}, { timestamps: true });

export const Category = mongoose.model("Category", categorySchema);