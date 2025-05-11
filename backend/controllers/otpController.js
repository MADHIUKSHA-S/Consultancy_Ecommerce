// controllers/otpController.js
import userModel from "../models/userModel.js";
import otpModel from "../models/otpModel.js";
import generateOTP from "../utils/otpGenerator.js";
import { sendVerificationEmail } from "../services/emailService.js";

// Send OTP for verification
const sendOTP = async (req, res) => {
  try {
    const { email, isNewUser } = req.body;

    // Log incoming request for debugging
    console.log("Received OTP request:", { email, isNewUser });

    // For new users, we don't need to check if they exist in the database
    if (!isNewUser) {
      // Check if user exists for existing users
      const user = await userModel.findOne({ email });

      // Make sure user exists before checking verification status
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // If user is already verified
      if (user.isVerified) {
        return res.status(400).json({
          success: false,
          message: "Email is already verified",
        });
      }
    }

    // Generate a new OTP
    const otp = generateOTP();

    // Save OTP to database (delete any existing OTP first)
    await otpModel.deleteMany({ email });
    await otpModel.create({ email, otp });

    // Send verification email - for new users, we don't have a name yet
    const userName = isNewUser
      ? "New User"
      : (await userModel.findOne({ email }))?.name || "User";
    const emailSent = await sendVerificationEmail(email, userName, otp);

    if (emailSent) {
      return res.status(200).json({
        success: true,
        message: "Verification OTP sent to your email",
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Failed to send verification email",
      });
    }
  } catch (error) {
    console.error("Send OTP error:", error);
    return res.status(500).json({
      success: false,
      message: "Error sending OTP",
      error: error.message,
    });
  }
};

// Verify OTP
const verifyOTP = async (req, res) => {
  try {
    const { email, otp, isNewUser } = req.body;

    // Log incoming verification request
    console.log("Received OTP verification:", { email, isNewUser });

    // Find the stored OTP
    const otpRecord = await otpModel.findOne({ email });
    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "OTP expired or not found. Please request a new OTP.",
      });
    }

    // Verify OTP
    if (otp !== otpRecord.otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // Delete the OTP record - do this regardless of user status
    await otpModel.deleteOne({ _id: otpRecord._id });

    // For new users, we don't need to update any existing user
    if (isNewUser === true) {
      console.log("Processing as new user");
      return res.status(200).json({
        success: true,
        message: "Email verified successfully",
        isNewUser: true,
      });
    }

    // For existing users, update their verified status
    console.log("Processing as existing user");
    const user = await userModel.findOneAndUpdate(
      { email },
      { isVerified: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please ensure you have registered first.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return res.status(500).json({
      success: false,
      message: "Error verifying OTP",
      error: error.message,
    });
  }
};

export { sendOTP, verifyOTP };

// In your OtpVerification.jsx component

// Verify the OTP
const verifyOtp = async () => {
  const otpValue = otp.join("");

  if (otpValue.length !== 6) {
    toast.error("Please enter a valid 6-digit OTP");
    return;
  }

  setIsLoading(true);
  try {
    // Log what we're sending for debugging
    console.log("Sending verification request:", {
      email,
      otp: otpValue,
      isNewUser: !!isNewUser, // Ensure it's a boolean
    });

    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/auth/verify-otp`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otp: otpValue,
          isNewUser: !!isNewUser, // Convert to boolean explicitly
        }),
      }
    );

    const data = await response.json();
    console.log("Verification response:", data);

    if (response.ok) {
      // Rest of your code...
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
  }
};
