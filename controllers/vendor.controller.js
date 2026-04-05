import Vendor from "../models/vendor.model.js";
import { Product } from "../models/product.model.js";
//import Order from "../models/order.model.js";
import jwt from "jsonwebtoken";


export const getProfile = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.vendor.id).select("-otp -otpExpiry");

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    res.status(200).json({ vendor });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// PUT /api/vendor/profile
// Only update name
export const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const vendor = await Vendor.findByIdAndUpdate(
      req.vendor.id,
      { name },
      { new: true }
    ).select("-otp -otpExpiry");

    res.status(200).json({ message: "Profile updated", vendor });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─── PRODUCTS ─────────────────────────────────────────────────────────────────

// GET /api/vendor/products
// View all products added by wholesalers
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({ isAvailable: true })
      .populate("wholesaler", "businessName phone")
      .sort({ createdAt: -1 });

    res.status(200).json({ products });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─── ORDERS ───────────────────────────────────────────────────────────────────

// POST /api/vendor/orders
// Place an order for a product
export const placeOrder = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({ message: "Product and quantity are required" });
    }

    const product = await Product.findById(productId).populate("wholesaler");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (!product.isAvailable) {
      return res.status(400).json({ message: "Product is not available" });
    }

    const totalPrice = product.price * quantity;

    const order = await Order.create({
      vendor: req.vendor.id,
      wholesaler: product.wholesaler._id,
      product: productId,
      quantity,
      totalPrice,
      status: "pending",
    });

    await order.populate([
      { path: "product", select: "name price" },
      { path: "wholesaler", select: "businessName phone" },
    ]);

    res.status(201).json({ message: "Order placed successfully", order });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /api/vendor/orders
// View all orders placed by this vendor
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ vendor: req.vendor.id })
      .populate("product", "name price")
      .populate("wholesaler", "businessName phone")
      .sort({ createdAt: -1 });

    res.status(200).json({ orders });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};