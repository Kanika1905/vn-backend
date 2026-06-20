import Razorpay from "razorpay";
import crypto from "crypto";
import Order from "../models/order.model.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body; // amount in rupees from frontend

    const options = {
      amount: amount * 100, // Razorpay needs paise, not rupees
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);
    res.status(200).json({ razorpayOrder });
  } catch (err) {
    res.status(500).json({ message: "Razorpay order creation failed", error: err.message });
  }
};


export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      // ✅ Signature matches — payment genuine
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: "paid",
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
      });
      return res.status(200).json({ success: true, message: "Payment verified" });
    } else {
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }
  } catch (err) {
    res.status(500).json({ message: "Verification failed", error: err.message });
  }
};