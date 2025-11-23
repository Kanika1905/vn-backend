// import mongoose from "mongoose";

// const connectDB = async () => {
//     try {
//         // Provide fallback values for MongoDB connection
//         const mongoUri = process.env.MONGO_DB_URI ||
//             `${process.env.MONGO_DB_URI}/${process.env.DB_NAME || 'vendor-nest'}`;

//         const conn = await mongoose.connect(mongoUri, {
//             // Connection options are automatically handled in newer mongoose versions
//         });
//         console.log(`MongoDB Connected:${conn.connection.host}`);
//     } catch (err) {
//         console.error(`MongoDB Connection Error: ${err.message}`);
//         process.exit(1);
//     }
// };

// export default connectDB;

import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_DB_URI;

    if (!mongoUri) {
      console.error("MongoDB URI is missing in .env");
      process.exit(1);
    }

    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`MongoDB Connection Error: ${err.message}`);
    process.exit(1);
  }
};

export default connectDB;
