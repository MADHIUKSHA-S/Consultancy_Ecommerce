import express from "express";
import {
  loginUser,
  registerUser,
  loginAdmin,
  forgotPassword,
  checkEmail,
} from "../controllers/userController.js";
import { sendOTP,verifyOTP } from "../controllers/otpController.js";
const userRouter = express.Router();
userRouter.post("/forgotpassword", forgotPassword);
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/admin", loginAdmin);
userRouter.post("/send-otp", sendOTP)
userRouter.post("/verify-otp",verifyOTP)
userRouter.post("/check-email",checkEmail)
export default userRouter;
