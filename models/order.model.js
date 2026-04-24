// models/order.model.js
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
    required: true,
  },
  wholesaler: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Wholesaler",
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  deliveryAddress: {
    type: String,
    required: true, // pulled from vendor.address at time of order
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "out_for_delivery", "delivered", "cancelled"],
    default: "pending",
  },
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);
export default Order;