import { useState } from "react";
import axiosInstance from "../utility/axiosInstance";
import { UseGlobalContext } from "../context/GlobalContext";

// Simple icon components

const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const GlobeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="2" y1="12" x2="22" y2="12"></line>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
  </svg>
);

const CopyIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
);

export default function ShortnerCard(props: any) {
  const [originalUrl, setOriginalUrl] = useState("");
  const [shortenedUrl, setShortenedUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { isLoggedIn } = UseGlobalContext();
  const [customDomain, setCustomDomain] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    if (isLoggedIn) {
      const res = await axiosInstance.post("/shortner/private/shorten", {
        originalUrl: originalUrl,
        // userId: userId,
      });
      console.log("url: ", res.data);
      setShortenedUrl(res.data);
      // props.setUrls(prevUrls => [res.data, ...prevUrls]);
      setIsLoading(false);
    }
  };
  const handleSubmitForCustom = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    if (isLoggedIn) {
      const res = await axiosInstance.post("/shortner/shorten/customUrl", {
        originalUrl: originalUrl,
        customUrl: customDomain,
      });
      console.log(res.data);
      setShortenedUrl(res.data);
      // props.setUrls(res.data)
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`${shortenedUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetForm = () => {
    setOriginalUrl("");
    setShortenedUrl("");
  };

  const closeCard = () => {
    props.setIsCardOpen(false);
    props.setIsCustomDomainFocused(false);
  };

  return (
    <div>
      {props.isCardOpen && (
        <div className="fixed inset-0 bg-gray-500/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          {/* Card */}
          <div className="bg-white rounded-xl overflow-hidden shadow-xl max-w-md w-full relative border border-gray-200 transition-all duration-500">
            {/* Close button */}
            <button
              onClick={closeCard}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <CloseIcon />
            </button>

            {/* Header */}
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <span className="text-blue-500"></span>
                URL Shortener
              </h2>
              <p className="text-gray-500 mt-1">
                Transform your long URLs into compact links
              </p>
            </div>

            {/* Content */}
            <div className="p-6">
              {!shortenedUrl ? (
                <div>
                  <div className="relative">
                    <input
                      type="url"
                      value={originalUrl}
                      onChange={(e) => setOriginalUrl(e.target.value)}
                      placeholder="Enter your long URL here"
                      className="w-full p-4 pl-10 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <span className="absolute left-3 top-4 text-gray-400">
                      <GlobeIcon />
                    </span>
                  </div>
                  {props.isCustomDomainFocused && (
                    <div className="flex items-start gap-2 mt-4 mb-4">
                      <div className="flex items-center text-sm text-gray-600 mr-2 mt-2">
                        <span>Domain:</span>
                      </div>
                      <div className="relative flex-1">
                        <div className="flex items-center">
                          <input
                            type="text"
                            value={customDomain}
                            onChange={(e) => setCustomDomain(e.target.value)}
                            className="w-full py-2 pl-1 pr-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          />
                        </div>
                        {/* {domainFocused && ( */}
                        <p className="text-xs text-gray-500 mt-1">
                          Enter your custom domain.
                        </p>
                        {/* )} */}
                      </div>
                    </div>
                  )}
                  <button
                    onClick={
                      props.isCustomDomainFocused
                        ? handleSubmitForCustom
                        : handleSubmit
                    }
                    disabled={isLoading}
                    className={`mt-4 w-full py-3 rounded-lg bg-blue-600 text-white font-medium transition-all hover:bg-blue-700 flex items-center justify-center ${
                      isLoading && "opacity-70 cursor-not-allowed"
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      "Shorten URL"
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="line-clamp-1 flex-1">{originalUrl}</span>
                  </div>

                  <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">
                        Your shortened URL
                      </p>
                      <p className="text-blue-600 font-medium">
                        {shortenedUrl}
                      </p>
                    </div>
                    <button
                      onClick={copyToClipboard}
                      className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-all"
                    >
                      {copied ? (
                        <span className="text-green-600 text-xs px-1">
                          Copied!
                        </span>
                      ) : (
                        <CopyIcon />
                      )}
                    </button>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={resetForm}
                      className="flex-1 py-2 rounded-lg bg-gray-100 text-gray-800 font-medium transition-all hover:bg-gray-200"
                    >
                      New URL
                    </button>
                    <button
                      onClick={closeCard}
                      className="flex-1 py-2 rounded-lg bg-blue-600 text-white font-medium transition-all hover:bg-blue-700"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer with futuristic touch */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <div className="flex justify-center space-x-1">
                <span className="w-1 h-1 rounded-full bg-blue-400 animate-pulse"></span>
                <span className="w-1 h-1 rounded-full bg-blue-500 animate-pulse delay-100"></span>
                <span className="w-1 h-1 rounded-full bg-blue-600 animate-pulse delay-200"></span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
