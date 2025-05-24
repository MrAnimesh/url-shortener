import axios from "axios";
import { useState } from "react";
import { FaEnvelope, FaClock, FaExclamationCircle } from "react-icons/fa";
import { ImSpinner8 } from "react-icons/im"; // For loading spinner

import { useLocation } from "react-router-dom";

const VerificationPage = () => {
  const location = useLocation();
  const response = location.state;
  const [isLoading, setIsLoading] = useState(false);
  const [popup, setPopup] = useState(false);

  const requestverificationLink = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    console.log("data: ", response);

    try {
      const res = await axios.post(
        "http://localhost:8081/api/auth/public/regeneratelink",
        { email: response.email }
      );
      setIsLoading(false);
      setPopup(true);
      setTimeout(() => setPopup(false), 3000);
      console.log(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      {/* Container */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 text-center">
        {/* Envelope Icon */}
        <div className="flex justify-center">
          <div className="p-6 bg-purple-100 rounded-full">
            <FaEnvelope className="h-12 w-12 text-purple-600" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-gray-900 mt-6">
          Verify Your Email
        </h1>

        {/* Description */}
        <p className="text-gray-600 mt-4">
          We've sent a verification link to your email address. Please check
          your inbox and click the link to activate your account.
        </p>

        {/* Timer Info */}
        <div className="mt-6 flex items-center justify-center space-x-2">
          <FaClock className="h-5 w-5 text-gray-500" />
          <p className="text-gray-600">
            The link is valid for{" "}
            <span className="font-semibold">24 hours</span>.
          </p>
        </div>

        <div className="text-center mt-6">
          <a
            href="/"
            className="text-purple-400 hover:text-purple-300 font-semibold transition-all duration-300"
          >
            ← Back to Login
          </a>
        </div>

        {/* Resend Link */}
        <div className="mt-8">
          <div className="text-gray-600">
            Didn't receive the email?{" "}
            <span
              onClick={requestverificationLink}
              className="text-purple-600 cursor-pointer hover:text-purple-700 font-semibold"
            >
              Resend Verification Link
            </span>
            <div className="flex justify-center">
              {isLoading ? (
                <ImSpinner8 className=" h-5 w-5 mt-2  text-black animate-spin" />
              ) : (
                popup && (
                  <p className="text-green-600">
                    New verification link has been sent on your email.
                  </p>
                )
              )}
            </div>
          </div>
        </div>

        {/* Email Check Reminder */}
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200 text-left">
          <div className="flex items-center space-x-2">
            <FaExclamationCircle className="h-5 w-5 text-yellow-600" />
            <p className="text-yellow-700">
              If you didn't receive the email, please check if the email address
              you provided is correct. If it's incorrect,{" "}
              <a
                href="/register"
                className="text-purple-600 hover:text-purple-700 font-semibold"
              >
                register with your email.
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationPage;
