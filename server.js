import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import routes from "./routes/index.js"; 
dotenv.config();
const app = express();
import cloudinary from "./config/cloudinary.js"; 
// Middleware
app.use(express.json());

// Database connection
connectDB();
// temporarily add this line in server.js after the env import, just to check:
console.log("CLOUDINARY NAME 👉", process.env.CLOUDINARY_CLOUD_NAME);
// Routes
app.use("/api", routes);

// Port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
