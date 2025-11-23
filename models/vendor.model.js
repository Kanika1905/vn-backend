import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema({
  phone: { 
    type: String, 
    required: true, 
    //unique: true 
  },

  name: { 
    type: String 
  }, // optional, since street vendors may not have a business name

  otp: { 
    type: String 
  }, // temporary OTP storage

  otpExpiry: { 
    type: Date 
  }, // OTP expiry time

  isVerified: { 
    type: Boolean, default: false 
  }, // phone verification status

}, { timestamps: true });

const Vendor = mongoose.model("Vendor", vendorSchema);

export default Vendor;