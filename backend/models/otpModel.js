// models/otpModel.js
import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600, // OTP expires after 10 minutes (600 seconds)
  },
});

// Create a TTL index on createdAt field
otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 600 });

// Use ES6 export syntax instead of CommonJS
const OtpModel = mongoose.model("Otp", otpSchema);
export default OtpModel;
