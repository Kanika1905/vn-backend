import { Product } from "../models/product.model.js";

/* ---------------------- CREATE PRODUCT ---------------------- */
export const createProduct = async (req, res) => {
  try {
    const {
      wholesalerId,
      categoryId,
      name,
      description,
      price,
      quantity,
      unit,
    } = req.body;
 
    // Required fields validation
    if (!wholesalerId || !categoryId || !name || !price || !quantity || !unit) {
      return res.status(400).json({
        success: false,
        message: "wholesalerId, categoryId, name, price, quantity, and unit are required.",
      });
    }
 
    // req.files is set by multer after uploading to Cloudinary
    // Each file has .path (HTTPS URL) and .filename (public_id)
    const images = (req.files || []).map((file) => file.path);
 
    const product = await Product.create({
      wholesalerId,
      categoryId,
      name,
      images,          // ← array of Cloudinary URLs (was single `image` string before)
      description,
      price,
      quantity,
      unit,
    });
 
    return res.status(201).json({
      success: true,
      message: "Product created successfully!",
      product,
    });
  } catch (error) {
    // If Cloudinary upload succeeded but DB save failed,
    // clean up the orphaned images from Cloudinary
    if (req.files?.length) {
      const deletePromises = req.files.map((f) =>
        cloudinary.uploader.destroy(f.filename)
      );
      await Promise.allSettled(deletePromises);
    }
 
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ---------------------- GET ALL PRODUCTS ---------------------- */
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find()
  .populate("wholesalerId", "businessName phone")  // 👈 add this
  .populate("categoryId");

    return res.status(200).json({
      success: true,
      total: products.length,
      products,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ---------------------- GET PRODUCT BY ID ---------------------- */
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("wholesalerId")
      .populate("categoryId");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ---------------------- UPDATE PRODUCT ---------------------- */
export const updateProduct = async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.productId,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ---------------------- DELETE PRODUCT ---------------------- */
export const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
 
    if (!deletedProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
 
    // Also delete images from Cloudinary when product is deleted
    if (deletedProduct.images?.length) {
      // Extract public_id from each Cloudinary URL
      // URL format: https://res.cloudinary.com/<cloud>/image/upload/v123/<public_id>.jpg
      const deletePromises = deletedProduct.images.map((url) => {
        const parts   = url.split("/");
        const file    = parts[parts.length - 1];           // "abc123.jpg"
        const publicId = "wholesaler/products/" + file.split(".")[0]; // "wholesaler/products/abc123"
        return cloudinary.uploader.destroy(publicId);
      });
      await Promise.allSettled(deletePromises);
    }
 
    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      deletedProduct,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
