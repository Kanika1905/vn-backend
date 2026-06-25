// scripts/simulateDriver.js
// Pretends to be a delivery driver: walks a driver marker from its current spot
// to the delivery destination, POSTing /location every ~1.5s through the running
// server (so connected app clients get live WebSocket updates).
//
// Usage:
//   node scripts/simulateDriver.js               # auto-picks an "out for delivery" order
//   node scripts/simulateDriver.js <orderId>     # full 24-char id
//   node scripts/simulateDriver.js A4821C        # or the 6-char code shown in the app
//
// Requires: the backend server running (npm run dev) — that's where the WS lives.
import dotenv from "dotenv";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import connectDB from "../config/db.js";
import Order from "../models/order.model.js";
import OrderTracking from "../models/orderTracking.model.js";

dotenv.config();

const API_URL = process.env.API_URL || "http://localhost:5000/api";
const STEPS = 24;
const INTERVAL_MS = 1500;
const lerp = (a, b, t) => a + (b - a) * t;

async function pickOrder(arg) {
  if (arg) {
    if (arg.length >= 24) {
      const byId = await Order.findById(arg).catch(() => null);
      if (byId) return byId;
    }
    const suffix = arg.toLowerCase();
    const all = await Order.find().select("_id");
    const match = all.find((o) => String(o._id).toLowerCase().endsWith(suffix));
    if (match) return Order.findById(match._id);
    return null;
  }
  return (await Order.findOne({ status: "out_for_delivery" })) || (await Order.findOne());
}

async function run() {
  await connectDB();
  const order = await pickOrder(process.argv[2]);
  if (!order) {
    console.log("No matching order found. Seed some data first (npm run seed:demo).");
    process.exit(1);
  }

  const tracking = await OrderTracking.findOne({ orderId: order._id });
  // Destination: tracking doc if seeded, else central Mumbai.
  const dest = tracking?.destLat != null
    ? { lat: tracking.destLat, lng: tracking.destLng }
    : { lat: 19.0760, lng: 72.8777 };
  // Start: current driver spot, else ~9km southwest of the destination.
  const start = tracking?.driverLat != null
    ? { lat: tracking.driverLat, lng: tracking.driverLng }
    : { lat: dest.lat - 0.08, lng: dest.lng - 0.08 };

  // Mint a short-lived token (auth just needs a valid JWT — no app login needed).
  const token = jwt.sign({ id: String(order.vendor) }, process.env.JWT_SECRET, { expiresIn: "1h" });

  const code = String(order._id).slice(-6).toUpperCase();
  console.log(`\n🚚 Simulating delivery for order #${code}  (${order._id})`);
  console.log(`   Posting to ${API_URL}`);
  console.log(`   → Open My Orders → this order → "View live map" in the app now.\n`);

  for (let i = 0; i <= STEPS; i++) {
    const t = i / STEPS;
    const lat = lerp(start.lat, dest.lat, t);
    const lng = lerp(start.lng, dest.lng, t);
    const status = t >= 1 ? "delivered" : t > 0.75 ? "arriving" : "out_for_delivery";

    try {
      const res = await fetch(`${API_URL}/orders/${order._id}/location`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ lat, lng, status, destLat: dest.lat, destLng: dest.lng }),
      });
      if (!res.ok) console.log(`\n  ⚠️  server responded ${res.status} (is it running?)`);
    } catch (e) {
      console.log(`\n  ⚠️  couldn't reach ${API_URL} — is the backend running? (${e.message})`);
    }

    process.stdout.write(`\r   step ${i}/${STEPS}  ·  ${status}        `);
    if (i < STEPS) await new Promise((r) => setTimeout(r, INTERVAL_MS));
  }

  console.log("\n\n✅ Delivered. Run again to replay.\n");
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error("Simulator failed:", err);
  process.exit(1);
});
