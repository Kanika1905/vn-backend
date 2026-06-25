// scripts/seedDemo.js
// Seeds realistic demo data: wholesalers, 10 vendors, products, and orders in
// mixed statuses (placed / accepted / out for delivery / delivered / cancelled),
// plus live-tracking docs for the "out for delivery" ones so the map has data.
//
// Idempotent: vendors/wholesalers/products are upserted by a natural key, and
// orders+tracking for the seeded vendors are wiped and recreated on each run.
//
// Run:  node scripts/seedDemo.js
import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/db.js";

import Vendor from "../models/vendor.model.js";
import Wholesaler from "../models/wholesaler.model.js";
import { Product } from "../models/product.model.js";
import { Category } from "../models/category.model.js";
import Order from "../models/order.model.js";
import OrderTracking from "../models/orderTracking.model.js";

dotenv.config();

// ── Demo definitions ─────────────────────────────────────────────────
const WHOLESALERS = [
  { phone: "8000000001", businessName: "Mehta Wholesale",      address: { shopAddress: "Unit 7, APMC Market", city: "Navi Mumbai", state: "Maharashtra", pincode: "400703" }, lat: 19.0330, lng: 73.0297 },
  { phone: "8000000002", businessName: "Verma Distributors",   address: { shopAddress: "Shop 22, Crawford Market", city: "Mumbai", state: "Maharashtra", pincode: "400001" }, lat: 18.9470, lng: 72.8347 },
  { phone: "8000000003", businessName: "Agarwal Supplies",     address: { shopAddress: "Plot 14, MIDC", city: "Thane", state: "Maharashtra", pincode: "400604" }, lat: 19.2183, lng: 72.9781 },
];

const CATEGORIES = [
  { name: "Staples",      group: "Staples & Essentials", emoji: "🌾" },
  { name: "Cooking Oils", group: "Staples & Essentials", emoji: "🫒" },
  { name: "Dairy",        group: "Staples & Essentials", emoji: "🥛" },
  { name: "Snacks",       group: "Household & More",     emoji: "🍪" },
];

// product → category name
const PRODUCTS = [
  { name: "Fortune Sunflower Oil 1L", category: "Cooking Oils", price: 140, quantity: 320, unit: "litre", w: 0 },
  { name: "Saffola Gold 1L",          category: "Cooking Oils", price: 185, quantity: 150, unit: "litre", w: 0 },
  { name: "Aashirvaad Atta 10kg",     category: "Staples",      price: 420, quantity: 85,  unit: "kg",    w: 0 },
  { name: "Tata Salt 1kg",            category: "Staples",      price: 24,  quantity: 12,  unit: "kg",    w: 1 },
  { name: "Basmati Rice 25kg",        category: "Staples",      price: 1850,quantity: 40,  unit: "kg",    w: 1 },
  { name: "Amul Milk Powder 1kg",     category: "Dairy",        price: 520, quantity: 60,  unit: "kg",    w: 2 },
  { name: "Parle-G (Box of 48)",      category: "Snacks",       price: 480, quantity: 200, unit: "box",   w: 2 },
  { name: "Sugar 50kg",               category: "Staples",      price: 2400,quantity: 25,  unit: "kg",    w: 1 },
];

const VENDORS = [
  { phone: "9000000001", businessName: "Sharma Traders",      area: "Andheri East",  lat: 19.1136, lng: 72.8697 },
  { phone: "9000000002", businessName: "Gupta Kirana",        area: "Bandra West",   lat: 19.0596, lng: 72.8295 },
  { phone: "9000000003", businessName: "Patel Stores",        area: "Dadar",         lat: 19.0186, lng: 72.8440 },
  { phone: "9000000004", businessName: "Verma Mart",          area: "Borivali",      lat: 19.2300, lng: 72.8567 },
  { phone: "9000000005", businessName: "Khan Provisions",     area: "Kurla",         lat: 19.0726, lng: 72.8845 },
  { phone: "9000000006", businessName: "Reddy Supermart",     area: "Powai",         lat: 19.1176, lng: 72.9060 },
  { phone: "9000000007", businessName: "Singh General Store", area: "Malad",         lat: 19.1860, lng: 72.8480 },
  { phone: "9000000008", businessName: "Iyer Bazaar",         area: "Chembur",       lat: 19.0620, lng: 72.9000 },
  { phone: "9000000009", businessName: "Mehta Mart",          area: "Goregaon",      lat: 19.1640, lng: 72.8490 },
  { phone: "9000000010", businessName: "Das Kirana",          area: "Vikhroli",      lat: 19.1100, lng: 72.9280 },
];

// Status plan per vendor (one order each here; a few vendors get a 2nd order).
// "placed" = pending, plus accepted / out_for_delivery (active) / delivered / cancelled.
const STATUS_CYCLE = ["pending", "out_for_delivery", "delivered", "accepted", "out_for_delivery", "delivered", "pending", "delivered", "cancelled", "out_for_delivery"];

const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);
const lerp = (a, b, t) => a + (b - a) * t;

async function ensureCategories() {
  const map = {};
  for (const c of CATEGORIES) {
    const doc = await Category.findOneAndUpdate(
      { name: c.name },
      { $set: { group: c.group, emoji: c.emoji }, $setOnInsert: { name: c.name } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    map[c.name] = doc;
  }
  return map;
}

async function run() {
  await connectDB();
  console.log("Seeding demo data…");

  // 1) Wholesalers (upsert by phone). Keep coords alongside the doc — lat/lng
  // are not in the schema, so they don't survive a DB round-trip.
  const wholesalers = [];
  for (const w of WHOLESALERS) {
    const doc = await Wholesaler.findOneAndUpdate(
      { phone: w.phone },
      { $set: { businessName: w.businessName, address: w.address, isProfileCompleted: true, isVerified: true } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    wholesalers.push({ doc, lat: w.lat, lng: w.lng });
  }
  console.log(`✓ ${wholesalers.length} wholesalers`);

  // 2) Categories
  const cats = await ensureCategories();
  console.log(`✓ ${Object.keys(cats).length} categories`);

  // 3) Products (upsert by wholesaler + name)
  const products = [];
  for (const p of PRODUCTS) {
    const doc = await Product.findOneAndUpdate(
      { wholesalerId: wholesalers[p.w].doc._id, name: p.name },
      { $set: { categoryId: cats[p.category]._id, price: p.price, quantity: p.quantity, unit: p.unit, description: `${p.name} — bulk wholesale stock.` } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    products.push(doc);
  }
  console.log(`✓ ${products.length} products`);

  // 4) Vendors (upsert by phone)
  const vendors = [];
  for (const v of VENDORS) {
    const doc = await Vendor.findOneAndUpdate(
      { phone: v.phone },
      { $set: { businessName: v.businessName, address: `${v.businessName}, ${v.area}, Mumbai`, isVerified: true } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    vendors.push({ ...v, doc });
  }
  console.log(`✓ ${vendors.length} vendors`);

  // 5) Wipe + recreate orders/tracking for these vendors only (keeps re-runs clean)
  const vendorIds = vendors.map((v) => v.doc._id);
  const oldOrders = await Order.find({ vendor: { $in: vendorIds } }).select("_id");
  await OrderTracking.deleteMany({ orderId: { $in: oldOrders.map((o) => o._id) } });
  await Order.deleteMany({ vendor: { $in: vendorIds } });

  let orderCount = 0;
  let trackingCount = 0;

  for (let i = 0; i < vendors.length; i++) {
    const v = vendors[i];
    // every vendor gets 1 order; vendors 0,2,4 get a 2nd (delivered, older)
    const plan = [{ status: STATUS_CYCLE[i % STATUS_CYCLE.length], age: i % 6 }];
    if (i % 2 === 0) plan.push({ status: "delivered", age: 7 + i });

    for (let j = 0; j < plan.length; j++) {
      const { status, age } = plan[j];
      const product = products[(i + j) % products.length];
      const qty = 2 + ((i + age) % 8);
      const wDef = wholesalers.find((w) => String(w.doc._id) === String(product.wholesalerId));

      const order = await Order.create({
        vendor: v.doc._id,
        wholesaler: wDef.doc._id,
        product: product._id,
        quantity: qty,
        totalPrice: product.price * qty,
        deliveryAddress: v.doc.address,
        status,
        paymentStatus: status === "delivered" ? "paid" : "unpaid",
        createdAt: daysAgo(age),
        updatedAt: daysAgo(Math.max(0, age - 1)),
      });
      orderCount++;

      // Live tracking for active + delivered orders
      if (status === "out_for_delivery" || status === "delivered") {
        const driverIsAtDest = status === "delivered";
        const t = driverIsAtDest ? 1 : 0.45 + (i % 3) * 0.15; // progress toward vendor
        await OrderTracking.create({
          orderId: order._id,
          destLat: v.lat,
          destLng: v.lng,
          driverLat: lerp(wDef.lat, v.lat, t),
          driverLng: lerp(wDef.lng, v.lng, t),
          status: driverIsAtDest ? "delivered" : t > 0.7 ? "arriving" : "out_for_delivery",
          updatedAt: new Date(),
        });
        trackingCount++;
      }
    }
  }

  console.log(`✓ ${orderCount} orders (${trackingCount} with live tracking)`);
  console.log("\nDone. Log in as any vendor with these phone numbers:");
  console.log("  " + VENDORS.map((v) => v.phone).join(", "));
  console.log("Wholesaler logins: " + WHOLESALERS.map((w) => w.phone).join(", "));

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
