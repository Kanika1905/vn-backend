import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
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

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;