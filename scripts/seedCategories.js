import mongoose from "mongoose";
import { Category } from "../models/category.model.js";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const categories = [
  // Grocery & Kitchen
  { name: "Fruits & Vegetables",     description: "Fresh fruits and vegetables",     group: "Grocery & Kitchen", emoji: "🥦" },
  { name: "Dairy, Bread & Eggs",     description: "Milk, bread, eggs and more",      group: "Grocery & Kitchen", emoji: "🥛" },
  { name: "Atta, Rice, Oil & Dals",  description: "Staples and cooking essentials",  group: "Grocery & Kitchen", emoji: "🌾" },
  { name: "Meat & Fish",             description: "Fresh meat and seafood",           group: "Grocery & Kitchen", emoji: "🍖" },
  { name: "Masala & Dry Fruits",     description: "Spices and dry fruits",            group: "Grocery & Kitchen", emoji: "🌶️" },
  { name: "Breakfast & Sauces",      description: "Cereals, jams and condiments",    group: "Grocery & Kitchen", emoji: "🥣" },
  { name: "Packaged Food",           description: "Ready to eat and instant meals",  group: "Grocery & Kitchen", emoji: "📦" },

  // Snacks & Drinks
  { name: "Tea, Coffee & More",      description: "Hot and cold beverages",          group: "Snacks & Drinks",   emoji: "☕" },
  { name: "Ice Creams & More",       description: "Frozen desserts",                 group: "Snacks & Drinks",   emoji: "🍦" },
  { name: "Frozen Food",             description: "Frozen snacks and meals",         group: "Snacks & Drinks",   emoji: "🧊" },
  { name: "Chips & Namkeen",         description: "Packaged snacks",                 group: "Snacks & Drinks",   emoji: "🍿" },
  { name: "Cold Drinks & Juices",    description: "Soft drinks and juices",          group: "Snacks & Drinks",   emoji: "🥤" },

  // Household
  { name: "Cleaning Supplies",       description: "Detergents and cleaners",         group: "Household",         emoji: "🧹" },
  { name: "Personal Care",           description: "Soaps, shampoo and hygiene",      group: "Household",         emoji: "🧴" },
  { name: "Home & Kitchen",          description: "Kitchen tools and home items",    group: "Household",         emoji: "🏠" },
];

await mongoose.connect(process.env.MONGO_URI);
// Clear old and re-seed
await Category.deleteMany({});
await Category.insertMany(categories);
console.log("Categories seeded ✓");
await mongoose.disconnect();