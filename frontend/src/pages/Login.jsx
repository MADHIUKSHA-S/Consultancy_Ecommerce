import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import eye icons
import { toast } from "react-toastify";

const Login = () => {
  const [currentState, setCurrentState] = useState("Sign Up");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();
  const { setToken, setUserName } = useContext(ShopContext);

  // Password validation function
  const validatePassword = (pass) => {
    // Check for minimum length

    if (pass.length < 8) {
      return "Password must be at least 8 characters long";
    }

    // Check for special character
    const specialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
    if (!specialChars.test(pass)) {
      return "Password must contain at least one special character";
    }

    return ""; // No error
  };

  // Clear password error when changing modes
  useEffect(() => {
    setPasswordError("");
    setConfirmPassword("");
  }, [currentState, forgotPasswordMode]);

  const togglePasswordVisibility = (field) => {
    if (field === "password") {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/forgot-password-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Password reset link has been sent to your email');
        setResetEmail('');
        setForgotPasswordMode(false);
        setCurrentState('Login');
      } else {
        toast.error(data.message || 'Failed to send reset link');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Network or server error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitHandler = async (event) => {
  event.preventDefault();

  if (forgotPasswordMode) {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Password reset link has been sent to your email');
        setEmail('');
        setForgotPasswordMode(false);
        setCurrentState('Login');
      } else {
        toast.error(data.message || 'Failed to send reset link');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Network or server error');
    }
    return;
  }

  // For Sign Up, validate password
  if (currentState === "Sign Up") {
    const error = validatePassword(password);
    if (error) {
      setPasswordError(error);
      return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
  }

  const endpoint =
    currentState === "Login"
      ? `${import.meta.env.VITE_BACKEND_URL}/api/user/login`
      : `${import.meta.env.VITE_BACKEND_URL}/api/user/register`;

  const payload =
    currentState === "Login"
      ? { email, password }
      : { name, email, password };

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.ok) {
      if (currentState === "Login") {
        // Check if email is verified
        if (data.requireVerification) {
          // Redirect to OTP verification page
          navigate("/verify-email", {
            state: {
              email,
              userId: data.userId,
              name: data.userName,
            },
          });
          return;
        }

        // If verified, proceed with login
        localStorage.setItem("token", data.token);
        localStorage.setItem("userName", data.userName);
        setToken(data.token);
        setUserName(data.userName);
        navigate("/");
      } else {
        // For sign up, redirect to OTP verification page
        navigate("/verify-email", {
          state: {
            email,
            userId: data.userId,
            name,
          },
        });
        
        // After successful signup, redirect to login page
        toast.success('Account created successfully! Please login.');
        setCurrentState("Login"); // Switch to login form
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        return;
      }
    } else {
      toast.error(data.message || "Something went wrong");
    }
  } catch (error) {
    console.error("Error:", error);
    toast.error("Network or server error");
  }

  setName("");
  setEmail("");
  setPassword("");
  setConfirmPassword("");
  setPasswordError("");
};
  return (
    <div className="min-h-[70vh] flex justify-center items-center py-12">
      <div className="w-full max-w-md px-6">
        <form
          onSubmit={forgotPasswordMode ? handleForgotPassword : onSubmitHandler}
          className="bg-white rounded-lg shadow-sm p-8 border border-gray-200"
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 prata-regular">
              {forgotPasswordMode ? "Reset Password" : currentState}
            </h2>
            <div className="mx-auto w-16 h-1 bg-blue-600 mt-2 rounded-full"></div>
          </div>

          {forgotPasswordMode ? (
            // Forgot Password Form
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-4">
                Enter your email address and we'll send you a link to reset your password.
              </p>
              <label
                htmlFor="reset-email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <input
                id="reset-email"
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
              />
              <div className="mt-6 flex gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 px-4 py-2 font-medium text-white bg-blue-600 
                    rounded-md shadow-sm transition-colors
                    ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
                >
                  {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setForgotPasswordMode(false);
                    setCurrentState("Login");
                  }}
                  className="flex-1 px-4 py-2 font-medium text-gray-700 bg-gray-100 
                    hover:bg-gray-200 rounded-md shadow-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            // Regular Login/Signup Form
            <>
              {!forgotPasswordMode && currentState !== "Login" && (
                <div className="mb-4">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Username
                  </label>
                  <input
                    id="name"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your username"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {forgotPasswordMode ? "New Password" : "Password"}
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className={`w-full px-3 py-2 border ${
                      passwordError ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 pr-10`}
                    placeholder={
                      forgotPasswordMode
                        ? "Enter new password"
                        : "Enter your password"
                    }
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (currentState === "Sign Up") {
                        setPasswordError(validatePassword(e.target.value));
                      }
                    }}
                    required
                  />
                  <div
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600"
                    onClick={() => togglePasswordVisibility("password")}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </div>
                </div>
                {passwordError && (
                  <p className="mt-1 text-sm text-red-600">{passwordError}</p>
                )}
                {currentState === "Sign Up" && !passwordError && password && (
                  <p className="mt-1 text-xs text-gray-500">
                    Password must be at least 8 characters and contain a special
                    character.
                  </p>
                )}
              </div>

              {/* Confirm Password field for Sign Up */}
              {currentState === "Sign Up" && (
                <div className="mb-4">
                  <label
                    htmlFor="confirm-password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      className={`w-full px-3 py-2 border ${
                        password !== confirmPassword && confirmPassword
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 pr-10`}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <div
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600"
                      onClick={() => togglePasswordVisibility("confirm")}
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </div>
                  </div>
                  {password !== confirmPassword && confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      Passwords do not match
                    </p>
                  )}
                </div>
              )}

              {/* Links for navigation between auth modes */}
              {!forgotPasswordMode && currentState === "Login" && (
                <div className="flex justify-between text-sm mb-4">
                  <p
                    className="text-blue-600 hover:text-blue-800 cursor-pointer"
                    onClick={() => {
                      setForgotPasswordMode(true);
                      setCurrentState("");
                    }}
                  >
                    Forgot your password?
                  </p>
                  <p
                    onClick={() => setCurrentState("Sign Up")}
                    className="text-blue-600 hover:text-blue-800 cursor-pointer"
                  >
                    Create a new account
                  </p>
                </div>
              )}

              {!forgotPasswordMode && currentState === "Sign Up" && (
                <div className="text-sm mb-4 text-right">
                  <p
                    onClick={() => setCurrentState("Login")}
                    className="text-blue-600 hover:text-blue-800 cursor-pointer"
                  >
                    Already have an account? Login
                  </p>
                </div>
              )}

              {forgotPasswordMode && (
                <div className="text-sm mb-4 text-right">
                  <p
                    onClick={() => {
                      setForgotPasswordMode(false);
                      setCurrentState("Login");
                    }}
                    className="text-blue-600 hover:text-blue-800 cursor-pointer"
                  >
                    Back to login
                  </p>
                </div>
              )}

              <button
                type="submit"
                className="w-full px-4 py-3 mt-2 font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {forgotPasswordMode
                  ? "Reset Password"
                  : currentState === "Login"
                  ? "Sign In"
                  : "Sign Up"}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;
