
import jwt from "jsonwebtoken";
import Vendor from "../models/vendor.model.js";
import Wholesaler from "../models/wholesaler.model.js";
import Admin from "../models/admin.model.js";

// -------------------- Vendor Login --------------------
export const loginVendor = async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ message: "Phone number is required" });
  }

  try {
    // Find vendor or create new one
    let vendor = await Vendor.findOne({ phone });

    if (!vendor) {
      vendor = await Vendor.create({ phone, isVerified: true });
    }

    return res.json({
      message: "Vendor login successful",
      vendorId: vendor._id,
      isVerified: vendor.isVerified,
    });
  } catch (error) {
    console.error("❌ Error in loginVendor:", error);
    return res.status(500).json({
      message: "Failed to login vendor",
      error: error.message,
    });
  }
};
// -------------------- Wholesaler Login --------------------
export const loginWholesaler = async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ message: "Phone number is required" });
  }

  try {
    let wholesaler = await Wholesaler.findOne({ phone });

    if (!wholesaler) {
      wholesaler = await Wholesaler.create({
        phone,
        isVerified: true,
        isProfileCompleted: false
      });
    }

    // ✅ CREATE TOKEN
    const token = jwt.sign(
      { id: wholesaler._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Wholesaler login successful",
      token, // 🔥 VERY IMPORTANT
      wholesalerId: wholesaler._id,
      isVerified: wholesaler.isVerified,
      isProfileCompleted: wholesaler.isProfileCompleted
    });
  } catch (error) {
    console.error("❌ Error in loginWholesaler:", error);
    return res.status(500).json({
      message: "Failed to login wholesaler"
    });
  }
};

// -------------------- Admin Login --------------------
export const loginAdmin = async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ message: "Phone number is required" });
  }

  try {
    let admin = await Admin.findOne({ phone });

    if (!admin) {
      admin = await Admin.create({ phone, isVerified: true });
    }

    return res.json({
      message: "Admin login successful",
      adminId: admin._id,
      isVerified: admin.isVerified,
    });
  } catch (error) {
    console.error("❌ Error in loginAdmin:", error);
    return res.status(500).json({
      message: "Failed to login admin",
      error: error.message,
    });
  }
};
