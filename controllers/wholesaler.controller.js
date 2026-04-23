import Wholesaler from "../models/wholesaler.model.js";
import { Product } from "../models/product.model.js";
import cloudinary from "../config/cloudinary.js";

/* ================================
   PRODUCTS (wholesaler-owned)
   All routes: /wholesaler/products
================================ */

// POST /wholesaler/products
export const addProduct = async (req, res) => {
  try {
    const wholesalerId = req.user.id;
    const { categoryId, name, description, price, quantity, unit } = req.body;

    if (!name || !price || !quantity || !unit) {
      return res.status(400).json({ success: false, message: "name, price, quantity and unit are required." });
    }

    const images = (req.files || []).map((file) => file.path);

    const product = await Product.create({
      wholesalerId,
      categoryId: categoryId,
      name,
      images,
      description,
      price,
      quantity,
      unit,
    });

    return res.status(201).json({ success: true, product });
  } catch (error) {
    console.error("Add Product Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /wholesaler/products
export const getMyProducts = async (req, res) => {
  try {
    const wholesalerId = req.user.id;
    const products = await Product.find({ wholesalerId })
      .populate("categoryId", "name")   // 👈 add this
      .sort({ createdAt: -1 });
    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /wholesaler/products/:productId
export const updateMyProduct = async (req, res) => {
  try {
    const wholesalerId = req.user.id;
    const { productId } = req.params;

    const product = await Product.findOneAndUpdate(
      { _id: productId, wholesalerId }, // ownership check
      req.body,
      { new: true, runValidators: true }
    ).populate("categoryId", "name");   // 👈 populate category

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    return res.status(200).json({ success: true, product });
  } catch (error) {
    console.error("Update Product Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /wholesaler/products/:productId
export const deleteMyProduct = async (req, res) => {
  try {
    const wholesalerId = req.user.id;
    const { productId } = req.params;

    const product = await Product.findOneAndDelete({
      _id: productId,
      wholesalerId, // ownership check — can only delete own products
    });

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Clean up images from Cloudinary
    if (product.images?.length) {
      const deletePromises = product.images.map((url) => {
        const parts = url.split("/");
        const file = parts[parts.length - 1];
        const publicId = "wholesaler/products/" + file.split(".")[0];
        return cloudinary.uploader.destroy(publicId);
      });
      await Promise.allSettled(deletePromises);
    }

    return res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete Product Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ================================
   PROFILE
   Routes: /wholesaler/profile
================================ */

// PUT /wholesaler/complete-profile
export const completeProfile = async (req, res) => {
  try {
    const wholesalerId = req.user.id;
    const { businessName, address } = req.body;

    if (
      !businessName || !address ||
      !address.shopAddress || !address.city ||
      !address.state || !address.pincode
    ) {
      return res.status(400).json({ success: false, message: "All profile fields are required" });
    }

    const wholesaler = await Wholesaler.findByIdAndUpdate(
      wholesalerId,
      {
        $set: {
          businessName,
          "address.shopAddress": address.shopAddress,
          "address.city": address.city,
          "address.state": address.state,
          "address.pincode": address.pincode,
          isProfileCompleted: true,
        },
      },
      { new: true, runValidators: true }
    );

    if (!wholesaler) {
      return res.status(404).json({ success: false, message: "Wholesaler not found" });
    }

    return res.status(200).json({ success: true, wholesaler });
  } catch (error) {
    console.error("Profile Update Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /wholesaler/profile
export const getWholesalerProfile = async (req, res) => {
  try {
    const wholesalerId = req.user.id;

    const wholesaler = await Wholesaler.findById(wholesalerId).select("-password -otp");

    if (!wholesaler) {
      return res.status(404).json({ success: false, message: "Wholesaler not found" });
    }

    return res.status(200).json({
      isProfileCompleted: wholesaler.isProfileCompleted,
      profile: wholesaler,
    });
  } catch (error) {
    console.error("GET PROFILE ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /wholesaler/update-profile
export const updateProfile = async (req, res) => {
  try {
    const wholesalerId = req.user.id;
    const { businessName, address } = req.body;

    const updateFields = {};

    if (businessName?.trim()) {
      updateFields.businessName = businessName.trim();
    }

    if (address) {
      if (address.shopAddress !== undefined) updateFields["address.shopAddress"] = address.shopAddress.trim();
      if (address.city !== undefined) updateFields["address.city"] = address.city.trim();
      if (address.state !== undefined) updateFields["address.state"] = address.state.trim();
      if (address.pincode !== undefined) updateFields["address.pincode"] = address.pincode.trim();
    }

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ success: false, message: "No fields to update" });
    }

    const updated = await Wholesaler.findByIdAndUpdate(
      wholesalerId,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select("-password -otp");

    if (!updated) {
      return res.status(404).json({ success: false, message: "Wholesaler not found" });
    }

    return res.status(200).json({ success: true, profile: updated });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};