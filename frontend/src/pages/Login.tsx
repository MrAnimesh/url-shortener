import axios from "axios";
import React, { useState } from "react";
import { FaEye, FaEyeSlash, FaGoogle, FaGithub, FaLink } from "react-icons/fa";
import { ImSpinner8 } from "react-icons/im";
import { Navigate, useNavigate } from "react-router-dom";
import { UseGlobalContext } from "../context/GlobalContext";
import { getApiUrl } from "../utility/config";

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

interface LoginCredentials {
  email: string;
  password: string;
}

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState("");
  const [loginCredentials, setLoginCredentials] = useState<LoginCredentials>({
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const { isLoggedIn, setIsLoggedIn } = UseGlobalContext();

  if (isLoggedIn || localStorage.getItem("accessToken")) {
    return <Navigate to="/home" replace />;
  }

  const handleOnChange: React.ComponentProps<"input">["onChange"] = (e) => {
    const { name, value } = e.target;

    setError("");
    setLoginCredentials({
      ...loginCredentials,
      [name]: value,
    });
  };

  const handleLogin: React.ComponentProps<"form">["onSubmit"] = async (e) => {
    e.preventDefault();

    try {
      setIsLoggingIn(true);
      setError("");

      const response = await axios.post(
        getApiUrl("/api/v1/auth/public/signin"),
        loginCredentials
      );
      const data = response.data;

      localStorage.setItem("accessToken", data.jwtToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("username", data.username ?? data.email ?? loginCredentials.email);
      localStorage.setItem("email", data.email ?? loginCredentials.email);
      setIsLoggedIn(true);
      navigate("/home", { replace: true });
    } catch (err) {
      console.log("err: ", err);
      setError("Your email ID or password is wrong.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-4">
      <div className="flex flex-col md:flex-row w-full max-w-6xl bg-white/95 rounded-lg shadow-xl border border-indigo-100 overflow-hidden">
        <div className="hidden md:flex flex-col justify-center items-center p-8 md:w-1/2 space-y-6 bg-gradient-to-br from-indigo-50 to-cyan-50">
          <a
            href="/home"
            className="flex items-center gap-2 text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500"
          >
            <span className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 flex items-center justify-center">
              <FaLink className="h-4 w-4 text-white" />
            </span>
            LinkShort
          </a>

          <h1 className="text-5xl font-bold text-gray-900 text-center">
            Welcome Back!
          </h1>
          <p className="text-lg text-gray-600 text-center max-w-md">
            Log in to access your personalized dashboard and continue your journey
            with us.
          </p>

          <div className="animate-bounce">
            <FaLink className="h-12 w-12 text-indigo-600" />
          </div>

          <div className="w-full mt-8 overflow-hidden relative h-40">
            <div className="absolute top-0 left-0 w-[500%] flex animate-carousel">
              {cardContent.map((card, index) => (
                <div
                  key={index}
                  className="min-w-[20%] flex-shrink-0 p-6 bg-white rounded-lg border border-gray-200 shadow-sm mx-2"
                >
                  <h3 className="text-xl font-bold text-gray-900">
                    {card.heading}
                  </h3>
                  <p className="text-gray-600">{card.desc}</p>
                </div>
              ))}

              {cardContent.map((card, index) => (
                <div
                  key={`duplicate-${index}`}
                  className="min-w-[20%] flex-shrink-0 p-6 bg-white rounded-lg border border-gray-200 shadow-sm mx-2"
                >
                  <h3 className="text-xl font-bold text-gray-900">
                    {card.heading}
                  </h3>
                  <p className="text-gray-600">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/2 p-8 md:p-12 bg-white">
          <h2 className="text-3xl font-bold mb-2 text-gray-900">Log In</h2>
          <p className="text-gray-600 mb-8">
            Welcome back. Enter your details to continue.
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={loginCredentials.email}
                className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                placeholder="Enter your email"
                onChange={handleOnChange}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={loginCredentials.password}
                  className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                  placeholder="Enter your password"
                  onChange={handleOnChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-indigo-600"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-500 to-cyan-400 text-white py-3 px-4 rounded-lg font-semibold shadow-md hover:shadow-lg active:scale-95 transition-all duration-200 flex items-center justify-center"
              disabled={isLoggingIn}
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

            <div className="flex space-x-4">
              <button
                type="button"
                className="w-1/2 flex items-center justify-center border border-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FaGoogle className="mr-2" /> Google
              </button>
              <button
                type="button"
                className="w-1/2 flex items-center justify-center border border-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FaGithub className="mr-2" /> GitHub
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <a
                  href="/register"
                  className="text-indigo-600 hover:text-indigo-700 font-semibold"
                >
                  Sign up
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>

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
