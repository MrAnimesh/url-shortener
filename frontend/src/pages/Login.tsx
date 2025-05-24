import axios from "axios";
import React, { useContext, useState } from "react";
import { FaEye, FaEyeSlash, FaGoogle, FaGithub, FaLink } from "react-icons/fa";
import { ImSpinner8 } from "react-icons/im"; // For loading spinner
import { useNavigate } from "react-router-dom";
import { UseGlobalContext } from "../context/GlobalContext";

// Card content
const cardContent = [
  {
    heading: "Fast & Reliable",
    desc: "Access your account instantly with 99.9% uptime.",
  },
  {
    heading: "Advanced Security",
    desc: "Protect your account with multi-factor authentication.",
  },
  {
    heading: "Seamless Integration",
    desc: "Connect with your favorite apps and services.",
  },
  {
    heading: "Customizable Dashboard",
    desc: "Personalize your experience with widgets and themes.",
  },
  {
    heading: "24/7 Support",
    desc: "Get help anytime with our dedicated support team.",
  },
];

interface credetenial {
  email: string,
  password: string
}

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false); // State to manage login progress
  const [error, setError] = useState(""); // State to manage error messages
  const navigate = useNavigate()
  const {setIsLoggedIn} = UseGlobalContext();

  const [loginCred, setLoginCred] = useState<credetenial>({
    email: "",
    password: ""
  })

  const handleOnChange: React.ComponentProps<"input">["onChange"] = (e) => {
    const {name, value} = e.target
    setLoginCred({...loginCred, [name]: value})
  }

  const handleLogin: React.ComponentProps<"form">["onSubmit"] = async (e) => {
    e.preventDefault();
    try{
      const response = await axios.post("http://localhost:8081/api/auth/public/signin", loginCred)
      const data = await response.data
      console.log(response.data);
      
      localStorage.setItem("accessToken", data.jwtToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('email', data.username)
      localStorage.setItem('userId', data.id)
      setIsLoggedIn(true);
      // localStorage.setItem("isLoggedIn", "true")
      navigate("/home")

    }catch(err){
      console.log("err: ",err);

    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black p-4">
      {/* Container */}
      <div className="flex flex-col md:flex-row w-full max-w-6xl bg-gray-800 rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-500 hover:scale-101">
        {/* Left Side - Website Info */}
        <div className="hidden md:flex flex-col justify-center items-center p-8 md:w-1/2 space-y-6 bg-gradient-to-br from-purple-600 to-blue-500">
          <h1 className="text-5xl font-bold text-white text-center">
            Welcome Back!
          </h1>
          <p className="text-lg text-gray-200 text-center">
            Log in to access your personalized dashboard and continue your journey
            with us.
          </p>

          {/* Link Icon */}
          <div className="animate-bounce">
            <FaLink className="h-12 w-12 text-white" />
          </div>

          {/* Card Carousel */}
          <div className="w-full mt-8 overflow-hidden relative h-40">
            <div className="absolute top-0 left-0 w-[500%] flex animate-carousel">
              {cardContent.map((card, index) => (
                <div
                  key={index}
                  className="min-w-[20%] flex-shrink-0 p-6 bg-white/10 backdrop-blur-sm rounded-lg border border-white/10 mx-2"
                >
                  <h3 className="text-xl font-bold text-white">
                    {card.heading}
                  </h3>
                  <p className="text-gray-200">{card.desc}</p>
                </div>
              ))}
              {/* Duplicate cards for seamless looping */}
              {cardContent.map((card, index) => (
                <div
                  key={`duplicate-${index}`}
                  className="min-w-[20%] flex-shrink-0 p-6 bg-white/10 backdrop-blur-sm rounded-lg border border-white/10 mx-2"
                >
                  <h3 className="text-xl font-bold text-white">
                    {card.heading}
                  </h3>
                  <p className="text-gray-200">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12">
          <h2 className="text-3xl font-bold mb-8 text-white">Log In</h2>

          {/* Error Message Section */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleLogin}>
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={loginCred.email}
                className="mt-1 block w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter your email"
                onChange={handleOnChange}
              />
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={loginCred.password}
                  className="mt-1 block w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your password"
                  onChange={handleOnChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 px-4 rounded-lg font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-101 flex items-center justify-center"
              disabled={isLoggingIn} // Disable button while logging in
            >
              {isLoggingIn ? (
                <>
                  <ImSpinner8 className="h-5 w-5 text-white animate-spin mr-2" />
                  Logging In...
                </>
              ) : (
                "Log In"
              )}
            </button>

            {/* Social Login Buttons */}
            <div className="flex space-x-4">
              <button
                type="button"
                className="w-1/2 flex items-center justify-center bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-all"
              >
                <FaGoogle className="mr-2" /> Google
              </button>
              <button
                type="button"
                className="w-1/2 flex items-center justify-center bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-all"
              >
                <FaGithub className="mr-2" /> GitHub
              </button>
            </div>

            {/* Don't have an account? Sign up */}
            <div className="text-center">
              <p className="text-sm text-gray-400">
                Don't have an account?{" "}
                <a
                  href="/register"
                  className="text-purple-400 hover:text-purple-300 font-semibold"
                >
                  Sign up
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* CSS for Carousel Animation */}
      <style>
        {`
          @keyframes carousel {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-carousel {
            animation: carousel 20s linear infinite;
          }
        `}
      </style>
    </div>
  );
};

export default Login;