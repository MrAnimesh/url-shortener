import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "../components/Header";
import axios from "axios";
import { checkAuth } from "../utility/Utils";
import { UseGlobalContext } from "../context/GlobalContext";
import axiosInstance from "../utility/axiosInstance";

type CheckType = string | null;

interface FeatureCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon,
}) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.98 }}
    className="p-6 bg-gray-800 rounded-lg shadow-lg text-center border border-gray-700 hover:border-blue-400 transition-colors duration-300"
  >
    {icon && <div className="text-blue-400 text-2xl mb-3">{icon}</div>}
    <h3 className="text-xl font-semibold text-blue-400">{title}</h3>
    <p className="text-gray-300 mt-2">{description}</p>
  </motion.div>
);

interface TestimonialProps {
  content: string;
  author: string;
}

const Testimonial: React.FC<TestimonialProps> = ({ content, author }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="p-6 bg-gray-800 rounded-lg shadow-lg border border-gray-700"
  >
    <p className="text-gray-300 italic">"{content}"</p>
    <p className="mt-4 text-blue-400 font-semibold">- {author}</p>
  </motion.div>
);

interface FaqItemProps {
  question: string;
  answer: string;
}

const FaqItem: React.FC<FaqItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      className="p-6 bg-gray-800 rounded-lg shadow-lg border border-gray-700"
      initial={{ opacity: 0.9 }}
      whileHover={{ opacity: 1 }}
    >
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-xl font-bold text-blue-400">{question}</h3>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-blue-400"
        >
          ▼
        </motion.div>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="mt-4 text-gray-300">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const Home: React.FC = () => {
  const [animatedIndex, setAnimatedIndex] = useState<number>(0);
  const [inputUrl, setInputUrl] = useState<string>("");
  const [shortUrl, setShortUrl] = useState<string>("");
  const { isLoggedIn } = UseGlobalContext();

  const urls: { full: string; short: string }[] = [
    {
      full: "https://example.com/very-long-url-that-needs-shortening",
      short: "https://short.ly/abc123",
    },
    {
      full: "https://another-long-url.com/path/to/resource?param=value",
      short: "https://short.ly/xyz789",
    },
    {
      full: "https://yetanotherwebsite.com/super-long-link-with-parameters",
      short: "https://short.ly/def456",
    },
  ];

  const testimonials: TestimonialProps[] = [
    {
      content: "This service is amazing! It's fast, reliable, and easy to use.",
      author: "John Doe",
    },
    {
      content:
        "I love the analytics feature. It helps me track my campaigns effectively.",
      author: "Jane Smith",
    },
    {
      content: "The custom URLs are a game-changer for my business.",
      author: "Mike Johnson",
    },
  ];

  const faqs: FaqItemProps[] = [
    {
      question: "How does URL shortening work?",
      answer:
        "Our service takes your long URL and generates a unique, shorter version that redirects to the original link. This makes sharing links easier and provides tracking capabilities.",
    },
    {
      question: "Is it free to use?",
      answer:
        "Yes, our basic URL shortening service is completely free to use. We also offer premium plans with advanced features for power users and businesses.",
    },
    {
      question: "Can I track clicks on my links?",
      answer:
        "Absolutely! Our analytics dashboard provides detailed insights into link performance, including geographic data, referrers, and time-based statistics.",
    },
    {
      question: "Are shortened links permanent?",
      answer:
        "Yes, once created, your shortened links will not expire and will continue to redirect to the original URL indefinitely.",
    },
  ];

  useEffect(() => {
    const token: CheckType = localStorage.getItem("accessToken");
    if (token) {
      checkAuth();
    }
    const interval = setInterval(() => {
      setAnimatedIndex((prev) => (prev + 1) % urls.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleShortenUrl = async () => {
    const userId = localStorage.getItem("userId");
    console.log(inputUrl);
    try {
      if (isLoggedIn) {
        const res = await axiosInstance.post("/shortner/private/shorten", {
          originalUrl: inputUrl,
          // userId: userId,
        });
        console.log(res.data);
        setShortUrl(res.data);
      } else {
        const res = await axios.post(
          "http://localhost:8081/shortner/public/shorten",
          {
            originalUrl: inputUrl,
            // userId: userId,
          }
        );
        console.log(res.data);
        setShortUrl(res.data);
      }
    } catch (err: any) {
      console.log("err", err.response.data);
    }
  };

  const copyToClipboard = async () => {
    const url: any = document.getElementById("shortenUrl")?.innerHTML;
    try {
      await navigator.clipboard.writeText(url);
      console.log("Content copied to clipboard");
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  return (
    <>
      {/* Style tag with animation keyframes */}
      <style>
        {" "}
        {`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
  
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
  
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
  
        @keyframes slideInFromLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
  
        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}
      </style>

      <div className="bg-white min-h-screen">
        {/* Header */}
        <Header />

        <main className="container mx-auto px-4 py-8">
          {/* Hero Section */}
          <section className="flex flex-col items-center justify-center py-20">
            <div className="text-center opacity-0 translate-y-[-20px] animate-[fadeInDown_0.8s_ease-out_forwards]">
              <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">
                Shorten Your Links Instantly
              </h1>
              <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
                Fast, secure, and customizable URL shortening for professionals
                and businesses.
              </p>
            </div>

            {/* URL Shortener Form */}
            <div className="mt-12 w-full max-w-2xl opacity-0 translate-y-[20px] animate-[fadeInUp_1s_ease-out_forwards]">
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-2">
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="Enter your URL here..."
                  className="w-full p-4 rounded-lg bg-gray-100 border-gray-200 border text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-lg"
                />
                <button
                  className="bg-gradient-to-r from-indigo-500 to-cyan-400 p-4 rounded-lg font-semibold text-white shadow-lg md:whitespace-nowrap transition-transform duration-200 hover:scale-105 active:scale-95"
                  onClick={handleShortenUrl}
                >
                  Shorten URL
                </button>
              </div>
              {shortUrl && (
                <div
                  className={`text-sm font-mono text-indigo-600 mt-4 flex justify-center items-center space-x-2`}
                >
                  <span id="shortenUrl">{shortUrl}</span>
                  <button
                    onClick={copyToClipboard}
                    className="ml-2 text-sm bg-indigo-500 text-white p-1 rounded transition-transform duration-200 hover:scale-110 active:scale-90"
                    aria-label="Copy to clipboard"
                  >
                    Copy
                  </button>
                </div>
              )}
            </div>

            {/* Popular Links Section */}
            <div className="mt-12 text-center bg-gray-50 p-6 rounded-lg shadow-lg max-w-2xl w-full">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                See it in action
              </h3>
              <div className="relative">
                {urls.map((url, index) => (
                  <div
                    key={`container-${index}`}
                    className={`${
                      animatedIndex === index ? "block" : "hidden"
                    }`}
                  >
                    <p
                      key={`full-${index}`}
                      className={`text-lg font-mono text-gray-500 truncate ${
                        animatedIndex === index
                          ? "animate-[slideInFromLeft_0.5s_ease-out_forwards]"
                          : ""
                      }`}
                    >
                      {url.full}
                    </p>
                    <div
                      key={`short-${index}`}
                      className={`text-xl font-mono text-indigo-600 mt-4 flex justify-center items-center space-x-2 ${
                        animatedIndex === index
                          ? "animate-[fadeInScale_0.5s_ease-out_forwards]"
                          : ""
                      }`}
                    >
                      <span>{url.short}</span>
                      <button
                        className="ml-2 text-sm bg-indigo-500 text-white p-1 rounded transition-transform duration-200 hover:scale-110 active:scale-90"
                        aria-label="Copy to clipboard"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Analytics Preview */}
          <section className="py-16">
            <h2 className="text-3xl font-bold text-center text-indigo-600 mb-12">
              Real-time Analytics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <FeatureCard
                title="Links Shortened"
                description="1,234,567"
                icon="🔗"
              />
              <FeatureCard
                title="Clicks Tracked"
                description="9,876,543"
                icon="👆"
              />
              <FeatureCard
                title="Active Users"
                description="10,000+"
                icon="👥"
              />
            </div>
          </section>

          {/* Features Section */}
          <section className="py-16 bg-gray-50 rounded-xl my-16">
            <div className="max-w-5xl mx-auto px-4">
              <h2 className="text-3xl font-bold text-center text-indigo-600 mb-12">
                Why Choose Our Service
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <FeatureCard
                  title="Custom URLs"
                  description="Create memorable, branded short links"
                />
                <FeatureCard
                  title="Detailed Analytics"
                  description="Track clicks, locations, and devices"
                />
                <FeatureCard
                  title="API Access"
                  description="Integrate with your applications"
                />
                <FeatureCard
                  title="QR Code Generation"
                  description="Generate QR codes for your links"
                />
              </div>
            </div>
          </section>

          {/* Call-to-Action (CTA) Section */}
          <section className="py-16 text-center">
            <div className="opacity-0 scale-90 animate-[fadeInScale_0.8s_ease-out_forwards]">
              <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">
                Start Shortening Links Today
              </h2>
              {!isLoggedIn && (
                <div>
                  <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
                    Join thousands of users who trust us for their link
                    management needs.
                  </p>
                  <button className="mt-8 bg-gradient-to-r from-indigo-500 to-cyan-400 px-8 py-4 rounded-lg font-semibold text-white text-lg shadow-lg transition-transform duration-200 hover:scale-105 active:scale-95">
                    Sign Up Now — It's Free!
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Testimonials Section */}
          <section className="py-16">
            <h2 className="text-3xl font-bold text-center text-indigo-600 mb-12">
              What Our Users Say
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <Testimonial
                  key={index}
                  content={testimonial.content}
                  author={testimonial.author}
                />
              ))}
            </div>
          </section>

          {/* FAQ Section */}
          <section className="py-16">
            <h2 className="text-3xl font-bold text-center text-indigo-600 mb-12">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4 max-w-3xl mx-auto">
              {faqs.map((faq, index) => (
                <FaqItem
                  key={index}
                  question={faq.question}
                  answer={faq.answer}
                />
              ))}
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-gray-100 py-12 border-t border-gray-200">
          <div className="container max-w-5xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  LinkShort
                </h3>
                <p className="text-gray-600">
                  Making the web more navigable, one link at a time.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4">
                  Company
                </h4>
                <ul className="space-y-2">
                  <li>
                    <a
                      href="#"
                      className="text-gray-600 hover:text-indigo-600 transition-colors"
                    >
                      About Us
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-600 hover:text-indigo-600 transition-colors"
                    >
                      Blog
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-600 hover:text-indigo-600 transition-colors"
                    >
                      Careers
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4">
                  Resources
                </h4>
                <ul className="space-y-2">
                  <li>
                    <a
                      href="#"
                      className="text-gray-600 hover:text-indigo-600 transition-colors"
                    >
                      Documentation
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-600 hover:text-indigo-600 transition-colors"
                    >
                      API
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-600 hover:text-indigo-600 transition-colors"
                    >
                      Status
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4">
                  Legal
                </h4>
                <ul className="space-y-2">
                  <li>
                    <a
                      href="#"
                      className="text-gray-600 hover:text-indigo-600 transition-colors"
                    >
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-600 hover:text-indigo-600 transition-colors"
                    >
                      Terms of Service
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-600 hover:text-indigo-600 transition-colors"
                    >
                      Cookie Policy
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-600">
                © 2023 LinkShort. All rights reserved.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a
                  href="#"
                  className="text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  <span className="sr-only">Twitter</span>
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  <span className="sr-only">GitHub</span>
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  <span className="sr-only">LinkedIn</span>
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Home;
