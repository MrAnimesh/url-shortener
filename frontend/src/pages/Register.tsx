import axios from "axios";
import React, { useState } from "react";
import { FaGoogle, FaGithub, FaEye, FaEyeSlash, FaLink } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { ImSpinner8 } from "react-icons/im";
import { getApiUrl } from "../utility/config";

const cardContent = [
  {
    heading: "Fast & Reliable",
    desc: "Shorten links instantly with 99.9% uptime.",
  },
  {
    heading: "Advanced Analytics",
    desc: "Track clicks, locations, and devices in real-time.",
  },
  {
    heading: "Custom URLs",
    desc: "Create branded, memorable short links.",
  },
  {
    heading: "Secure Links",
    desc: "Protect your links with passwords and malware scanning.",
  },
  {
    heading: "Generate QR",
    desc: "Generate QR code for your website and businesses.",
  },
];

interface User {
  username: string;
  email: string;
  password: string;
}

interface RegisterError {
  message: string;
  verified?: boolean;
}

const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const getRegisterError = (error: unknown): RegisterError => {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data;

    if (typeof responseData === "string") {
      return { message: responseData };
    }

    if (responseData?.message) {
      return {
        message: responseData.message,
        verified: responseData.verified,
      };
    }
  }

  return { message: "Something went wrong. Please try again." };
};

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [error, setError] = useState<RegisterError | null>(null);
  const [showResendPopup, setShowResendPopup] = useState(false);
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);

  const [user, setUser] = useState<User>({
    username: "",
    email: "",
    password: "",
  });

  const handleOnChange: React.ComponentProps<"input">["onChange"] = (e) => {
    const { name, value } = e.target;
    setError(null);
    setUser({ ...user, [name]: value });
  };

  const handleSubmit: React.ComponentProps<"form">["onSubmit"] = async (e) => {
    e.preventDefault();

    if (!isValidEmail(user.email)) {
      setError({ message: "Please enter a valid email address." });
      return;
    }

    try {
      setIsSigningUp(true);
      setError(null);

      const response = await axios.post(
        getApiUrl("/api/v1/auth/public/register"),
        user
      );

      navigateToVerification(response.data);
    } catch (err) {
      console.log(err);
      setError(getRegisterError(err));
    } finally {
      setIsSigningUp(false);
    }
  };

  const requestVerificationLink: React.MouseEventHandler<HTMLSpanElement> = async (e) => {
    e.preventDefault();

    try {
      setIsResendingVerification(true);
      const res = await axios.post(
        getApiUrl("/api/v1/auth/public/regeneratelink"),
        { email: user.email }
      );

      setShowResendPopup(true);
      setTimeout(() => setShowResendPopup(false), 3000);
      console.log(res.data);
    } catch (err) {
      console.log(err);
      setError(getRegisterError(err));
    } finally {
      setIsResendingVerification(false);
    }
  };

  const navigateToVerification = (data: unknown) => {
    navigate("/verification", { state: data });
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
            Shorten Your Links
          </h1>
          <p className="text-lg text-gray-600 text-center max-w-md">
            Make your links shorter, smarter, and shareable. Join the future of
            seamless connectivity.
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
          <h2 className="text-3xl font-bold mb-2 text-gray-900">Sign Up</h2>
          <p className="text-gray-600 mb-8">
            Create your account and start shortening links.
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
              {error.message}

              {error.verified === false && (
                <p>
                  If not received click on{" "}
                  <span
                    onClick={requestVerificationLink}
                    className="text-blue-700 cursor-pointer"
                  >
                    resend
                  </span>{" "}
                  to get a new link.
                </p>
              )}

              {isResendingVerification && (
                <span className="flex justify-center">
                  <ImSpinner8 className="h-5 w-5 mt-2 text-black animate-spin" />
                </span>
              )}

              {showResendPopup && (
                <div className="right-4 p-4 bg-green-50 border border-green-200 text-green-600 rounded-lg shadow-lg">
                  Link has been resent. Kindly check your email.
                </div>
              )}
            </div>
          )}
         
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                placeholder="Enter your username"
                onChange={handleOnChange}
                value={user.username}
              />
            </div>

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
                className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                placeholder="Enter your email"
                onChange={handleOnChange}
                value={user.email}
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
                  className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                  placeholder="Enter your password"
                  onChange={handleOnChange}
                  value={user.password}
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
              className="w-full bg-gradient-to-r from-indigo-500 to-cyan-400 text-white py-3 px-4 rounded-lg font-semibold shadow-md hover:shadow-lg active:scale-95 transition-all duration-200"
              disabled={isSigningUp}
            >
              {isSigningUp ? (
                <span className="flex justify-center">
                  <ImSpinner8 className="h-5 w-5 text-white animate-spin mr-2" />
                  Signing Up...
                </span>
              ) : (
                "Sign Up"
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
                Already have an account?{" "}
                <a
                  href="/login"
                  className="text-indigo-600 hover:text-indigo-700 font-semibold"
                >
                  Log in
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

export default Register;
