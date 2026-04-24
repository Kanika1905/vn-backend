import Vendor from "../models/vendor.model.js";
import { Product } from "../models/product.model.js";
import jwt from "jsonwebtoken";
import Order from "../models/order.model.js";


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


// vendor.controller.js — replace ALL req.vendor.id with req.user.id

export const getProfile = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.user.id).select("-otp -otpExpiry"); // ✅
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });
    res.status(200).json({ vendor });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { businessName, address } = req.body;
    if (!businessName || !address) {
      return res.status(400).json({ message: "Business name and address are required" });
    }
    const vendor = await Vendor.findByIdAndUpdate(
      req.user.id, // ✅
      { businessName, address },
      { new: true }
    ).select("-otp -otpExpiry");
    res.status(200).json({ message: "Profile updated", vendor });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const placeOrder = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId || !quantity) {
      return res.status(400).json({ message: "Product and quantity are required" });
    }

    const vendor = await Vendor.findById(req.user.id); // ✅
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });
    if (!vendor.address) {
      return res.status(400).json({ message: "Please add your delivery address in profile first" });
    }

    const product = await Product.findById(productId).populate("wholesalerId"); // ✅ your field is wholesalerId
    if (!product) return res.status(404).json({ message: "Product not found" });

    const totalPrice = product.price * quantity;

    const order = await Order.create({
      vendor: req.user.id, // ✅
      wholesaler: product.wholesalerId._id, // ✅ fixed field name
      product: productId,
      quantity,
      totalPrice,
      deliveryAddress: vendor.address,
      status: "pending",
    });

    await order.populate([
      { path: "product", select: "name price images unit quantity" },
      { path: "wholesaler", select: "businessName phone" },
      { path: "vendor", select: "businessName phone address" },
    ]);

    res.status(201).json({ message: "Order placed successfully", order });
  } catch (err) {
    console.error("placeOrder error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ vendor: req.user.id }) // ✅
      .populate("product", "name price images unit quantity")
      .populate("wholesaler", "businessName phone")
      .sort({ createdAt: -1 });
    res.status(200).json({ orders });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};