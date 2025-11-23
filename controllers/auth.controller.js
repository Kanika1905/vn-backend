 import Vendor from "../models/vendor.model.js";
import Wholesaler from "../models/wholesaler.model.js";
import Admin from "../models/admin.model.js";
//import { generateOTP, sendSmsOTP } from "../utils/twilioSms.js";

// -------------------- Vendor Login --------------------
export const loginVendor = async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ message: "Phone number is required" });
  }

  const otp = generateOTP();

  try {
    // save/update OTP
    await Vendor.findOneAndUpdate(
      { phone },
      { phone, otp, otpExpiry: new Date(Date.now() + 5 * 60 * 1000) },
      { upsert: true, new: true }
    );

    // send SMS
    await sendSmsOTP(phone, otp, "Vendor");

    return res.json({ message: "OTP sent successfully ✅", otp }); // add otp for debugging
  } catch (error) {
    console.error("❌ Error in loginVendor:", error);
    return res.status(500).json({
      message: "Failed to send OTP",
      error: error.message, // always return exact error
    });
  }
};

// -------------------- Vendor Verify --------------------
export const verifyVendorOTP = async (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ message: "Phone and OTP are required" });
  }

  try {
    const vendor = await Vendor.findOne({ phone });

    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    if (vendor.otp !== otp || vendor.otpExpiry < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Clear OTP and mark as verified
    vendor.otp = null;
    vendor.otpExpiry = null;
    vendor.isVerified = true; // ✅ Mark phone as verified
    await vendor.save();

    res.json({ 
      message: "Vendor login successful", 
      vendorId: vendor._id,
      isVerified: vendor.isVerified 
    });
  } catch (error) {
    res.status(500).json({ message: "OTP verification failed", error: error.message });
  }
};

// -------------------- Wholesaler Login --------------------
export const loginWholesaler = async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ message: "Phone number is required" });
  }

  const otp = generateOTP();

  try {
    await Wholesaler.findOneAndUpdate(
      { phone },
      { phone, otp, otpExpiry: new Date(Date.now() + 5 * 60 * 1000) },
      { upsert: true, new: true }
    );

    await sendSmsOTP(phone, otp, "Wholesaler");

    res.json({ message: "OTP sent successfully to Wholesaler" });
  } catch (error) {
    console.error("❌ Error in login wholesaler:", error);
    return res.status(500).json({
      message: "Failed to send OTP",
      error: error.message, // always return exact error
    });
  }
};

// -------------------- Wholesaler Verify --------------------
export const verifyWholesalerOTP = async (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ message: "Phone and OTP are required" });
  }

  try {
    const wholesaler = await Wholesaler.findOne({ phone });

    if (!wholesaler) return res.status(404).json({ message: "Wholesaler not found" });

    if (wholesaler.otp !== otp || wholesaler.otpExpiry < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Clear OTP and mark as verified
    wholesaler.otp = null;
    wholesaler.otpExpiry = null;
    wholesaler.isVerified = true; // ✅ Mark phone as verified
    await wholesaler.save();

    res.json({ 
      message: "Wholesaler login successful", 
      wholesalerId: wholesaler._id,
      isVerified: wholesaler.isVerified 
    });
  } catch (error) {
    res.status(500).json({ message: "OTP verification failed", error: error.message });
  }
};

// -------------------- Admin Login --------------------
export const loginAdmin = async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ message: "Phone number is required" });
  }

  const otp = generateOTP();

  try {
    await Admin.findOneAndUpdate(
      { phone },
      { phone, otp, otpExpiry: new Date(Date.now() + 5 * 60 * 1000) }, // 5 mins expiry
      { upsert: true, new: true }
    );

    await sendSmsOTP(phone, otp, "Admin");

    res.json({ message: "OTP sent successfully to Admin" });
  } catch (error) {
    console.error("❌ Error in login admin:", error);
    return res.status(500).json({
      message: "Failed to send OTP",
      error: error.message,
    });
  }
};

// -------------------- Admin Verify --------------------
export const verifyAdminOTP = async (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ message: "Phone and OTP are required" });
  }

  try {
    const admin = await Admin.findOne({ phone });

    if (!admin) return res.status(404).json({ message: "Admin not found" });

    if (admin.otp !== otp || admin.otpExpiry < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // ✅ Clear OTP and mark as verified
    admin.otp = null;
    admin.otpExpiry = null;
    admin.isVerified = true;
    await admin.save();

    res.json({
      message: "Admin login successful",
      adminId: admin._id,
      isVerified: admin.isVerified,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "OTP verification failed", error: error.message });
  }
};
