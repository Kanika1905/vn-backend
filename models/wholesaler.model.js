import mongoose from "mongoose";

const wholesalerSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    otp: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },

    // ✅ FIX: these fields MUST be in the schema or Mongoose ignores them
    businessName: {
      type: String,
      default: "",
    },
    address: {
      shopAddress: { type: String, default: "" },
      city:        { type: String, default: "" },
      state:       { type: String, default: "" },
      pincode:     { type: String, default: "" },
    },

    isProfileCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Wholesaler = mongoose.model("Wholesaler", wholesalerSchema);
export default Wholesaler;