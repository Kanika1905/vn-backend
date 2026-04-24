import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema({
  phone: { 
    type: String, 
    required: true, 
  },

  businessName: { 
    type: String 
  },

  address: {
    type: String
  },

  otp: { 
    type: String 
  },

  otpExpiry: { 
    type: Date 
  },

  isVerified: { 
    type: Boolean, default: false 
  },

}, { timestamps: true });

const Vendor = mongoose.model("Vendor", vendorSchema);

export default Vendor;