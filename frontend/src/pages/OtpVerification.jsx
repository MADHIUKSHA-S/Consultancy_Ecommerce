import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ShopContext } from "../context/ShopContext";
import { useContext } from "react";

const OtpVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { email, userId, name } = location.state || {};
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds
  const [resendDisabled, setResendDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { setToken, setUserName } = useContext(ShopContext);

  const inputRefs = useRef([]);

  // Redirect if no email is provided (direct page access)
  useEffect(() => {
    if (!email) {
      navigate("/login");
      toast.error("Please sign up or login first");
    }
  }, [email, navigate]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      setResendDisabled(false);
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Handle input change and auto-focus next input
  const handleChange = (index, value) => {
    if (value.length > 1) {
      // If pasted content with multiple characters
      const pastedValue = value.slice(0, 6);
      const newOtp = [...otp];

      for (let i = 0; i < pastedValue.length; i++) {
        if (i + index < 6) {
          newOtp[i + index] = pastedValue[i];
        }
      }

      setOtp(newOtp);

      // Focus the next empty input or the last one
      const nextIndex = Math.min(index + pastedValue.length, 5);
      if (inputRefs.current[nextIndex]) {
        inputRefs.current[nextIndex].focus();
      }
      return;
    }

    // For single character input
    if (/^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto focus next input
      if (value && index < 5) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  // Handle backspace key
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      // Move to previous input when backspace is pressed on empty input
      inputRefs.current[index - 1].focus();
    }
  };

  // Send OTP to user email
  const requestOtp = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/send-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("OTP sent successfully");
        setTimeLeft(120); // Reset timer
        setResendDisabled(true);
      } else {
        toast.error(data.message || "Failed to send OTP");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast.error("Network or server error");
    } finally {
      setIsLoading(false);
    }
  };

  // Verify the OTP
  const verifyOtp = async () => {
    const otpValue = otp.join("");

    if (otpValue.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/verify-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, otp: otpValue }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Email verified successfully");

        // Check if we have login data
        if (data.token) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("userName", data.user.name || name);
          setToken(data.token);
          setUserName(data.user.name || name);
        }

        navigate("/");
      } else {
        toast.error(data.message || "Invalid OTP");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error("Network or server error");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle back button
  const handleBack = () => {
    navigate("/login");
  };

  // Send OTP on first render if email is available
  useEffect(() => {
    if (email) {
      requestOtp();
    }
  }, []);

  return (
    <div className="min-h-[70vh] flex justify-center items-center py-12">
      <div className="w-full max-w-md px-6">
        <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 prata-regular">
              Verify Your Email
            </h2>
            <div className="mx-auto w-16 h-1 bg-blue-600 mt-2 rounded-full"></div>
            <p className="mt-4 text-gray-600">
              We've sent a 6-digit verification code to
            </p>
            <p className="font-medium text-gray-800">{email}</p>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
              Enter verification code
            </label>
            <div className="flex justify-between gap-2">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength="1"
                  className="w-12 h-12 text-center text-xl border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  value={otp[index]}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={(e) => {
                    e.preventDefault();
                    const pastedData = e.clipboardData.getData("text");
                    handleChange(index, pastedData);
                  }}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <button
              onClick={verifyOtp}
              disabled={isLoading || otp.join("").length !== 6}
              className={`w-full px-4 py-3 font-medium text-white ${
                isLoading || otp.join("").length !== 6
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              } rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
            >
              {isLoading ? "Verifying..." : "Verify Email"}
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-600">Didn't receive the code?</p>
              <div className="flex items-center justify-center mt-2">
                {resendDisabled ? (
                  <p className="text-sm text-gray-600">
                    Resend code in {formatTime(timeLeft)}
                  </p>
                ) : (
                  <button
                    onClick={requestOtp}
                    disabled={isLoading || resendDisabled}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    {isLoading ? "Sending..." : "Resend Code"}
                  </button>
                )}
              </div>
            </div>

            <button
              onClick={handleBack}
              className="text-gray-600 hover:text-gray-800 text-sm mt-4"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtpVerification;
