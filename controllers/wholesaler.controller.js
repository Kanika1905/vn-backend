// import Wholesaler from "../models/wholesaler.model.js";
// import { Product } from "../models/product.model.js";

// /**
//  * ================================
//  *  ADD PRODUCT
//  * ================================
//  */
// export const addProduct = async (req, res) => {
//   try {
//     const wholesalerId = req.user.id; // from auth middleware

//     const {
//       categoryId,
//       name,
//       image,
//       description,
//       price,
//       quantity,
//       unit
//     } = req.body;

//     if (!categoryId || !name || !price || !quantity || !unit) {
//       return res.status(400).json({ message: "Missing required fields" });
//     }

//     const product = await Product.create({
//       wholesalerId,
//       categoryId,
//       name,
//       image,
//       description,
//       price,
//       quantity,
//       unit
//     });

//     res.status(201).json(product);
//   } catch (error) {
//     console.error("Add Product Error:", error);
//     res.status(500).json({ message: "Failed to add product" });
//   }
// };

// /**
//  * ================================
//  *  GET MY PRODUCTS (HOME SCREEN)
//  * ================================
//  */
// export const getMyProducts = async (req, res) => {
//   try {
//     const wholesalerId = req.user.id;

//     const products = await Product.find({ wholesalerId })
//       .sort({ createdAt: -1 });

//     res.status(200).json(products);
//   } catch (error) {
//     console.error("Fetch Products Error:", error);
//     res.status(500).json({ message: "Failed to fetch products" });
//   }
// };

// /**
//  * ================================
//  *  UPDATE PRODUCT
//  * ================================
//  */
// export const updateProduct = async (req, res) => {
//   try {
//     const wholesalerId = req.user.id;
//     const { productId } = req.params;

//     const product = await Product.findOneAndUpdate(
//       { _id: productId, wholesalerId }, // ownership check
//       req.body,
//       { new: true }
//     );

//     if (!product) {
//       return res.status(404).json({ message: "Product not found" });
//     }

//     res.status(200).json(product);
//   } catch (error) {
//     console.error("Update Product Error:", error);
//     res.status(500).json({ message: "Failed to update product" });
//   }
// };

// /**
//  * ================================
//  *  DELETE PRODUCT
//  * ================================
//  */
// export const deleteProduct = async (req, res) => {
//   try {
//     const wholesalerId = req.user.id;
//     const { productId } = req.params;

//     const product = await Product.findOneAndDelete({
//       _id: productId,
//       wholesalerId
//     });

//     if (!product) {
//       return res.status(404).json({ message: "Product not found" });
//     }

//     res.status(200).json({ message: "Product deleted successfully" });
//   } catch (error) {
//     console.error("Delete Product Error:", error);
//     res.status(500).json({ message: "Failed to delete product" });
//   }
// };

// /**
//  * ================================
//  *  COMPLETE WHOLESALER PROFILE
//  * ================================
//  */
// export const completeProfile = async (req, res) => {
//   try {
//     const wholesalerId = req.user.id;
//     const { businessName, address } = req.body;

//     if (
//       !businessName ||
//       !address ||
//       !address.shopAddress ||
//       !address.city ||
//       !address.state ||
//       !address.pincode
//     ) {
//       return res.status(400).json({
//         message: "All profile fields are required"
//       });
//     }

//     const wholesaler = await Wholesaler.findByIdAndUpdate(
//       req.user.id,
//       {
//         businessName,
//         address,
//         isProfileCompleted: true
//       },
//       { new: true }
//     );

//     res.status(200).json(wholesaler);
//   } catch (error) {
//     console.error("Profile Update Error:", error);
//     res.status(500).json({ message: "Failed to complete profile" });
//   }
// };
// //================================================================//
// // GET wholesaler profile
// export const getWholesalerProfile = async (req, res) => {
//   try {
//     const wholesalerId = req.user.id; // comes from auth middleware

//     const wholesaler = await Wholesaler.findById(wholesalerId).select(
//       "-password -otp"
//     );

//     if (!wholesaler) {
//       return res.status(404).json({
//         message: "Wholesaler not found",
//       });
//     }

//     res.status(200).json({
//       isProfileCompleted: wholesaler.isProfileCompleted,
//       profile: wholesaler,
//     });
//   } catch (error) {
//     console.error("GET PROFILE ERROR:", error);
//     res.status(500).json({
//       message: "Failed to fetch profile",
//     });
//   }
// };


import Wholesaler from "../models/wholesaler.model.js";
import { Product } from "../models/product.model.js";

/**
 * ================================
 *  ADD PRODUCT
 * ================================
 */
export const addProduct = async (req, res) => {
  try {
    const wholesalerId = req.user.id;

    const { categoryId, name, image, description, price, quantity, unit } =
      req.body;

    if (!categoryId || !name || !price || !quantity || !unit) {
      return res.status(400).json({ message: "Missing required fields" });
    }

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

    res.status(201).json(product);
  } catch (error) {
    console.error("Add Product Error:", error);
    res.status(500).json({ message: "Failed to add product" });
  }
};

/**
 * ================================
 *  GET MY PRODUCTS (HOME SCREEN)
 * ================================
 */
export const getMyProducts = async (req, res) => {
  try {
    const wholesalerId = req.user.id;

    const products = await Product.find({ wholesalerId }).sort({
      createdAt: -1,
    });

    res.status(200).json(products);
  } catch (error) {
    console.error("Fetch Products Error:", error);
    res.status(500).json({ message: "Failed to fetch products" });
  }
};

/**
 * ================================
 *  UPDATE PRODUCT
 * ================================
 */
export const updateProduct = async (req, res) => {
  try {
    const wholesalerId = req.user.id;
    const { productId } = req.params;

    const product = await Product.findOneAndUpdate(
      { _id: productId, wholesalerId },
      req.body,
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error("Update Product Error:", error);
    res.status(500).json({ message: "Failed to update product" });
  }
};

/**
 * ================================
 *  DELETE PRODUCT
 * ================================
 */
export const deleteProduct = async (req, res) => {
  try {
    const wholesalerId = req.user.id;
    const { productId } = req.params;

    const product = await Product.findOneAndDelete({
      _id: productId,
      wholesalerId,
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete Product Error:", error);
    res.status(500).json({ message: "Failed to delete product" });
  }
};

/**
 * ================================
 *  COMPLETE WHOLESALER PROFILE
 * ================================
 */
export const completeProfile = async (req, res) => {
  try {
    const wholesalerId = req.user.id;
    const { businessName, address } = req.body;

    console.log("COMPLETE PROFILE HIT — wholesalerId:", wholesalerId);
    console.log("BODY:", req.body);

    if (
      !businessName ||
      !address ||
      !address.shopAddress ||
      !address.city ||
      !address.state ||
      !address.pincode
    ) {
      return res.status(400).json({
        message: "All profile fields are required",
      });
    }

    // FIX: use explicit $set so Mongoose doesn't ignore nested fields
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
      return res.status(404).json({ message: "Wholesaler not found" });
    }

    console.log("UPDATED WHOLESALER:", wholesaler);

    res.status(200).json(wholesaler);
  } catch (error) {
    console.error("Profile Update Error:", error);
    res.status(500).json({ message: "Failed to complete profile" });
  }
};

/**
 * ================================
 *  GET WHOLESALER PROFILE
 * ================================
 */
export const getWholesalerProfile = async (req, res) => {
  try {
    const wholesalerId = req.user.id;

    const wholesaler = await Wholesaler.findById(wholesalerId).select(
      "-password -otp"
    );

    if (!wholesaler) {
      return res.status(404).json({
        message: "Wholesaler not found",
      });
    }

    res.status(200).json({
      isProfileCompleted: wholesaler.isProfileCompleted,
      profile: wholesaler,
    });
  } catch (error) {
    console.error("GET PROFILE ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch profile",
    });
  }
};

// ── ADD THIS to your wholesaler.controller.js ──────────────────────────────

// PUT /wholesaler/update-profile
export const updateProfile = async (req, res) => {
  try {
    const wholesalerId = req.user.id; // from auth middleware

    const { businessName, address } = req.body;

    // Build update object with only provided fields
    const updateFields = {};

    if (businessName !== undefined && businessName.trim() !== "") {
      updateFields.businessName = businessName.trim();
    }

    if (address) {
      if (address.shopAddress !== undefined)
        updateFields["address.shopAddress"] = address.shopAddress.trim();
      if (address.city !== undefined)
        updateFields["address.city"] = address.city.trim();
      if (address.state !== undefined)
        updateFields["address.state"] = address.state.trim();
      if (address.pincode !== undefined)
        updateFields["address.pincode"] = address.pincode.trim();
    }

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    const updated = await Wholesaler.findByIdAndUpdate(
      wholesalerId,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select("-password -otp");

    if (!updated) {
      return res.status(404).json({ message: "Wholesaler not found" });
    }

    return res.status(200).json({
      message: "Profile updated successfully",
      profile: updated,
    });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// ── ADD THIS ROUTE in your wholesaler.routes.js ─────────────────────────────
// router.put("/update-profile", authMiddleware, updateProfile);