import express from "express";
import http from "http";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import routes from "./routes/index.js";
import { initTrackingHub } from "./realtime/trackingHub.js";
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

// Wrap Express in an HTTP server so we can attach the tracking WebSocket
// (WS /ws/orders/:orderId) on the same port.
const server = http.createServer(app);
initTrackingHub(server);

// Port
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
