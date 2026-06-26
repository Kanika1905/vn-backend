import Razorpay from "razorpay";
import crypto from "crypto";
import Order from "../models/order.model.js";

let razorpay = null;

if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  console.log("✅ Razorpay initialized with key_id:", process.env.RAZORPAY_KEY_ID);
} else {
  console.error("❌ RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET missing in .env file");
}

export const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body; // amount in rupees from frontend

    if (!amount || amount <= 0) {
      console.warn("❌ Invalid amount:", amount);
      return res.status(400).json({ message: "Invalid amount" });
    }

    if (!razorpay) {
      console.error("❌ Razorpay not initialized - missing credentials");
      return res.status(500).json({ message: "Payment service not configured" });
    }

    const options = {
      amount: Math.round(amount * 100), // paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    console.log("📦 Creating Razorpay order for amount:", amount, "rupees");
    const razorpayOrder = await razorpay.orders.create(options);
    console.log("✅ Razorpay order created:", razorpayOrder.id);

    res.status(200).json({ razorpayOrder });
  } catch (err) {
    // Razorpay SDK errors often carry useful detail in err.error
    console.error("❌ Razorpay order creation failed:", err?.error || err.message);
    res.status(500).json({
      message: "Razorpay order creation failed",
      error: err?.error?.description || err.message,
    });
  }
};

// Pure signature check — call this right after RazorpayCheckout.open() resolves,
// BEFORE you create any Order documents. No DB writes happen here.
export const verifySignature = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      console.warn("❌ Missing payment verification fields", req.body);
      return res.status(400).json({ success: false, message: "Missing payment details" });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      console.log("✅ Signature verified for", razorpay_payment_id);
      return res.status(200).json({ success: true, message: "Signature verified" });
    }

    // This is the case that produces "Invalid signature" — almost always a
    // key_id/key_secret mismatch between frontend build and backend env.
    console.error("❌ Signature mismatch for", razorpay_payment_id);
    console.error("   using key_secret ending in:", (process.env.RAZORPAY_KEY_SECRET || "").slice(-4));
    return res.status(400).json({ success: false, message: "Invalid signature - payment verification failed" });
  } catch (err) {
    console.error("❌ Signature verification error:", err.message);
    res.status(500).json({ success: false, message: "Verification failed", error: err.message });
  }
};

// Attaches confirmed payment details to an already-created Order.
// Call this AFTER verifySignature succeeded AND the Order exists.
export const attachPaymentToOrder = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Re-verify signature here too — never trust a client-supplied "it's verified" flag.
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.error("❌ Signature mismatch while attaching payment to order:", orderId);
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        paymentStatus: "paid",
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
      },
      { new: true }
    );

    if (!updatedOrder) {
      console.error("❌ Order not found for ID:", orderId);
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    console.log("✅ Order", orderId, "marked paid");
    return res.status(200).json({ success: true, message: "Payment attached", order: updatedOrder });
  } catch (err) {
    console.error("❌ attachPaymentToOrder error:", err.message);
    res.status(500).json({ success: false, message: "Failed to attach payment", error: err.message });
  }
};