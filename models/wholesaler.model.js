// import mongoose from "mongoose";

// const addressSchema = new mongoose.Schema(
//   {
//     shopAddress: {
//       type: String,     
//     },
//     city: {
//       type: String,
//     },
//     state: {
//       type: String,
//     },
//     pincode: {
//       type: String,
//     }
//   },
//   { _id: false }
// );

// const wholesalerSchema = new mongoose.Schema(
//   {
//     phone: {
//       type: String,
//       required: true,
//       // unique: true
//     },

//     businessName: {
//       type: String
//     },

//     address: addressSchema,

//     otp: {
//       type: String
//     },

//     otpExpiry: {
//       type: Date
//     },

//     isVerified: {
//       type: Boolean,
//       default: false
//     },

//     isProfileCompleted: {
//       type: Boolean,
//       default: false
//     }
//   },
//   { timestamps: true }
// );

// const Wholesaler = mongoose.model("Wholesaler", wholesalerSchema);

// export default Wholesaler;
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