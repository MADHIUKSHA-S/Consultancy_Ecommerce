import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import eye icons
import { toast } from 'react-toastify';
const Login = () => {
  const [currentState, setCurrentState] = useState("Sign Up");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Added for password visibility
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false); // Added for forgot password
  const navigate = useNavigate();
  const { setToken, setUserName } = useContext(ShopContext);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    const endpoint =
      forgotPasswordMode
        ? `${import.meta.env.VITE_BACKEND_URL}/api/user/forgotPassword`
        : currentState === "Login"
        ? `${import.meta.env.VITE_BACKEND_URL}/api/user/login`
        : `${import.meta.env.VITE_BACKEND_URL}/api/user/register`;

    const payload =
      forgotPasswordMode
        ? { email, newPassword: password }
        : currentState === "Login"
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
        if (forgotPasswordMode) {
          toast.success("Password updated successfully. Please login.");
          setForgotPasswordMode(false);
          setCurrentState("Login");
        } else if (currentState === "Login") {
          localStorage.setItem("token", data.token);
          localStorage.setItem("userName", data.userName);
          setToken(data.token);
          setUserName(data.userName);
          navigate("/");
        } else {
          setCurrentState("Login");
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
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800"
    >
      <div className="inline-flex items-center gap-2 mt-10 mb-2">
        <p className="text-3xl prata-regular">
          {forgotPasswordMode ? "Forgot Password" : currentState}
        </p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
      </div>

      {!forgotPasswordMode && currentState !== "Login" && (
        <input
          type="text"
          className="w-full px-3 py-2 border border-gray-800"
          placeholder="Username"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      )}

      <input
        type="email"
        className="w-full px-3 py-2 border border-gray-800"
        placeholder="user@gmail.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <div className="w-full relative">
        <input
          type={showPassword ? "text" : "password"}
          className="w-full px-3 py-2 border border-gray-800"
          placeholder={forgotPasswordMode ? "New Password" : "Password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div
          className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
          onClick={togglePasswordVisibility}
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </div>
      </div>

      {!forgotPasswordMode && currentState === "Login" && (
  <div className="flex justify-between w-full text-sm mt-[-8px]">
    <p
      className="cursor-pointer"
      onClick={() => {
        setForgotPasswordMode(true);
        setCurrentState(""); // Hide login/signup text
      }}
    >
      Forgot your password?
    </p>
    <p
      onClick={() => setCurrentState("Sign Up")}
      className="cursor-pointer"
    >
      Create a new account
    </p>
  </div>
)}

{!forgotPasswordMode && currentState === "Sign Up" && (
  <div className="w-full text-sm mt-[-8px] text-right">
    <p
      onClick={() => setCurrentState("Login")}
      className="cursor-pointer"
    >
      Login here
    </p>
  </div>
)}


      <button className="px-8 py-2 mt-4 font-light text-white bg-black">
        {forgotPasswordMode
          ? "Reset Password"
          : currentState === "Login"
          ? "Sign In"
          : "Sign Up"}
      </button>
    </form>
  );
};

export default Login;
