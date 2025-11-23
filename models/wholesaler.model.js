import mongoose from "mongoose";

const wholesalerSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: true,
        //unique: true
    },
    businessName: {
        type: String,
        //required: true 
    },
    otp: { 
        type: String 
    },
    otpExpiry: { 
        type: Date 
    },
    isVerified: { 
        type: Boolean, 
        default: false 
    }, // phone verification status
}, { timestamps: true });

const Wholesaler = mongoose.model("Wholesaler", wholesalerSchema);

export default Wholesaler;