import mongoose from "mongoose";
import { Category } from "../models/category.model.js";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const categories = [
  { name: "Fruits",             description: "Fresh fruits" },
  { name: "Vegetables",         description: "Fresh vegetables" },
  { name: "Grains",             description: "Rice, wheat, pulses" },
  { name: "Dairy",              description: "Milk, paneer, butter" },
  { name: "Household Supplies", description: "Cleaning and home essentials" },
  { name: "Snacks & Beverages", description: "Packaged snacks and drinks" },
];

await mongoose.connect(process.env.MONGO_URI);
await Category.insertMany(categories, { ordered: false }).catch(() => {});
console.log("Categories seeded ✓");
await mongoose.disconnect();