import { useState } from "react";
import axiosInstance from "../utility/axiosInstance";
import { UseGlobalContext } from "../context/GlobalContext";
import validateField from "./Validate";

type UrlForm = {
  originalUrl: string;
  shortenedUrl: string;
  customDomain: string;
};

export default function ShortnerCard(props: any) {

  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { isLoggedIn } = UseGlobalContext();

  const [urlForm, setUrlForm] = useState<UrlForm>({
    originalUrl: "",
    shortenedUrl: "",
    customDomain: "",
  });

  const [urlFormError, setUrlFormError] = useState<
    Partial<Record<keyof UrlForm, string>>
  >({});

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setUrlForm((prev) => ({ ...prev, [name]: value }));

    const error = validateField(name, value);
    setUrlFormError((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e: any) => {
    console.log("Is getting clicked");
    
    e.preventDefault();

    const errors: Record<string, string> = {};
    Object.entries(["originalUrl"]).forEach(([name, value]) => {
      const error = validateField(name, value);
      if (error) errors[name] = error;
    });
    setUrlFormError(errors);
    if (Object.keys(errors).length > 0) {
      return; // stop submission due to validation errors
    }

    console.log("hiiiiiii");

    setIsLoading(true);
    if (isLoggedIn) {
      try {
        const res = await axiosInstance.post("/shortner/private/shorten", {
          originalUrl: urlForm.originalUrl,
        });
        console.log("url: ", res.data);
        setUrlForm((prev) => ({ ...prev, shortenedUrl: res.data }));

        setIsLoading(false);
      } catch {
        setIsLoading(false);
      }
    }
  };

  const handleSubmitForCustom = async (e: any) => {
    e.preventDefault();

    const errors: Record<string, string> = {};
    Object.entries(urlForm).forEach(([name, value]) => {
      const error = validateField(name, value);
      if (error) errors[name] = error;
    });
    setUrlFormError(errors);
    if (Object.keys(errors).length > 0) {
      return; // stop submission due to validation errors
    }

    setIsLoading(true);
    if (isLoggedIn) {
      try {
        const res = await axiosInstance.post("/shortner/shorten/customUrl", {
          originalUrl: urlForm.originalUrl,
          customUrl: urlForm.customDomain,
        });
        setUrlForm((prev) => ({ ...prev, shortenedUrl: res.data }));
        setIsLoading(false);
      } catch {
        setIsLoading(false);
      }
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`${urlForm.shortenedUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetForm = () => {
    setUrlForm({
      originalUrl: "",
      shortenedUrl: "",
      customDomain: "",
    });
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
              <span className="material-icons">close</span>
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
              {!urlForm.shortenedUrl ? (
                <div>
                  <div className="relative">
                    <input
                      type="url"
                      value={urlForm.originalUrl}
                      name="originalUrl"
                      onChange={handleChange}
                      placeholder="Enter your long URL here"
                      className="w-full p-4 pl-10 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <span className="material-icons absolute left-3 top-4 text-gray-400">
                      language
                    </span>
                  </div>
                  {urlFormError.originalUrl && (
                    <p className="mt-2 text-sm text-red-600">
                      {urlFormError.originalUrl}
                    </p>
                  )}

                  {props.isCustomDomainFocused && (
                    <div className="flex items-start gap-2 mt-4 mb-4">
                      <div className="relative flex-1">
                        {
                          <span className="text-gray-400 text-sm">
                            http://localhost:8081/{urlForm.customDomain}
                          </span>
                        }
                        <div className="flex items-center">
                          <input
                            type="text"
                            value={urlForm.customDomain}
                            placeholder="Enter your custom path"
                            name="customDomain"
                            onChange={handleChange}
                            className="w-full py-2 pl-1 pr-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          />
                        </div>
                        {urlFormError.customDomain && (
                          <p className="mt-2 text-sm text-red-600">
                            {urlFormError.customDomain}
                          </p>
                        )}
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
                    <span className="line-clamp-1 flex-1">
                      {urlForm.originalUrl}
                    </span>
                  </div>

                  <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">
                        Your shortened URL
                      </p>
                      <p className="text-blue-600 font-medium">
                        {urlForm.shortenedUrl}
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
                        <span className="material-icons">content_copy</span>
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
