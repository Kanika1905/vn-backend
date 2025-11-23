import { Product } from "../models/product.model.js";

/* ---------------------- CREATE PRODUCT ---------------------- */
export const createProduct = async (req, res) => {
  try {
    const {
      wholesalerId,
      categoryId,
      name,
      image,
      description,
      price,
      quantity,
      unit
    } = req.body;

    // Required fields validation
    if (!wholesalerId || !categoryId || !name || !price || !quantity || !unit) {
      return res.status(400).json({
        success: false,
        message:
          "wholesalerId, categoryId, name, price, quantity, and unit are required.",
      });
    }

    // Create product
    const product = await Product.create({
      wholesalerId,
      categoryId,
      name,
      image,
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
      req.params.id,
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
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
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
