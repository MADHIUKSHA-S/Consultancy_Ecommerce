import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validator from "validator";
import nodemailer from "nodemailer";
import userModel from "../models/userModel.js";

// INFO: Function to create token
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

// INFO: Route for user login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (isPasswordCorrect) {
      const token = createToken(user._id);
      res.status(200).json({ success: true, token, userName: user.name });
    } else {
      res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }
  } catch (error) {
    console.log("Error while logging in user: ", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// INFO: Route for user registration
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // INFO: Check if user already exists
    const userExists = await userModel.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    // INFO: Validating email and password
    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid email" });
    }
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    // INFO: Hashing user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // INFO: Create new user
    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
    });

    // INFO: Save user to database
    const user = await newUser.save();

    const token = jwt.sign(
      { id: user._id, email: user.email }, // 👈 include both id and email
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // INFO: Return success response
    res.status(200).json({ success: true, token });
  } catch (error) {
    console.log("Error while registering user: ", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Don't log sensitive information (password)
    console.log("ADMIN LOGIN ATTEMPT:", email);

    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      // Create a token with the email (and possibly user ID) as the payload
      const token = jwt.sign({ email }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      res.status(200).json({ success: true, token });
    } else {
      res
        .status(401)
        .json({ success: false, message: "Invalid email or password" }); // 401 is more appropriate for auth errors
    }
  } catch (error) {
    console.log("Error while logging in admin: ", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
// Forgot Password - Change User Password
const forgotPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    // Check if email and new password provided
    if (!email || !newPassword) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // Validate email
    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid email" });
    }

    // Validate new password length
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    // Find user by email
    const user = await userModel.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user's password
    user.password = hashedPassword;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Error while changing password:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Forgot Password Route
const forgotPasswordRequest = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Save reset token to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
     // Change this in your backend code
html: `
  <h1>Password Reset Request</h1>
  <p>Click the link below to reset your password:</p>
  <a href="${resetUrl}" onclick="window.open('${resetUrl}', '_self'); return false;">Reset Password</a>
  <p>This link will expire in 1 hour.</p>
`,
    });

    res.json({ message: "Password reset link sent to email" });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({ message: "Error sending reset email" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findOne({
      _id: decoded.userId,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
    }

    // Validate new password length
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    // Hash the new password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password and clear reset token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ success: true, message: "Password has been reset successfully, please login" });
  } catch (error) {
    console.error("Reset password error:", error);
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
    }
    res.status(500).json({ success: false, message: "Error resetting password" });
  }
};
// Check if email exists
export const checkEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email is already registered",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Email is available",
    });
  } catch (error) {
    console.error("Email check error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while checking email",
      error: error.message,
    });
  }
};

export {
  loginUser,
  registerUser,
  loginAdmin,
  forgotPassword,
  forgotPasswordRequest,
  resetPassword,
};
