// models/orderTracking.model.js
// One tracking document per order, holding the latest driver location, the
// delivery destination (coords), and the live delivery status.
import mongoose from "mongoose";

const orderTrackingSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true,
      index: true,
    },
    driverLat: { type: Number, default: null },
    driverLng: { type: Number, default: null },
    // Destination coords are kept here because Order only stores a string
    // address. A driver/agent app (or an order-creation hook) seeds these.
    destLat: { type: Number, default: null },
    destLng: { type: Number, default: null },
    status: {
      type: String,
      enum: ["preparing", "out_for_delivery", "arriving", "delivered"],
      default: "preparing",
    },
    updatedAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

const OrderTracking = mongoose.model("OrderTracking", orderTrackingSchema);
export default OrderTracking;
