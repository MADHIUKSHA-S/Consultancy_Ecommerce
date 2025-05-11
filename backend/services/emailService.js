// services/emailService.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create nodemailer transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send verification email with OTP
 * @param {string} to - Recipient email
 * @param {string} name - Recipient name
 * @param {string} otp - One-time password
 * @returns {Promise<boolean>} - Success status
 */
const sendVerificationEmail = async (to, name, otp) => {
  try {
    const mailOptions = {
      from: `"Your App" <${process.env.EMAIL_FROM || "noreply@yourapp.com"}>`,
      to,
      subject: "Email Verification OTP",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #333;">Verify Your Email</h2>
          <p>Hello ${name},</p>
          <p>Thank you for registering with our service. Please use the following OTP (One-Time Password) to verify your email address:</p>
          <div style="background-color: #f5f5f5; padding: 12px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; border-radius: 4px; margin: 20px 0;">
            ${otp}
          </div>
          <p>This OTP is valid for 10 minutes. If you didn't request this, please ignore this email.</p>
          <p style="margin-top: 30px; font-size: 13px; color: #888;">
            This is an automated email. Please do not reply to this message.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending verification email:", error);
    return false;
  }
};

// Using ES6 named export instead of CommonJS module.exports
export { sendVerificationEmail };
