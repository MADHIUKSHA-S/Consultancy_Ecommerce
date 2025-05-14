import express from "express";
import {
  loginUser,
  registerUser,
  loginAdmin,
  forgotPassword,
  forgotPasswordRequest,
  resetPassword,
  checkEmail,
} from "../controllers/userController.js";
import { sendOTP, verifyOTP } from "../controllers/otpController.js";

const router = express.Router();

router.post("/forgot-password-request", forgotPasswordRequest);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/admin", loginAdmin);
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/check-email", checkEmail);

export default router;
