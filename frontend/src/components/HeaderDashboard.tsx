import React, { useEffect, useState } from "react";
import { UseGlobalContext } from "../context/GlobalContext";
import { getLoggedInUserName } from "../utility/authUser";
import { logout } from "../utility/Utils";
import PremiumButton from "./PremiumButton";
import PremiumOnly from "./PremiumOnly";

const HeaderDashboard: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isLoggedIn, isPremiumUser, isAdmin } = UseGlobalContext();
  const username = getLoggedInUserName();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    setMenuOpen(false);
    void logout();
  };

  return (
    <header
      className={`w-full p-4 fixed top-0 left-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white shadow-lg border-b border-gray-200"
          : "bg-white/80 backdrop-blur-sm border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2 hover:scale-105 transition-transform duration-200">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-white"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <a
            className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500"
            href="/home"
          >
            Url Dashboard
          </a>
          {isPremiumUser && <sup>Premium</sup>}
        </div>

        <div className="hidden md:flex items-center">
          {isAdmin && !isPremiumUser && <PremiumButton />}
        </div>

        <div className="md:hidden relative">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="focus:outline-none p-1 rounded-full bg-gray-100 border border-gray-200 active:scale-90 transition-transform duration-200"
            aria-label="Open menu"
          >
            <div className="w-6 h-6 flex flex-col justify-center items-center">
              <span
                className={`w-5 h-0.5 bg-gray-800 block transition-all duration-300 mb-1.5 ${
                  menuOpen ? "rotate-45 translate-y-2" : ""
                }`}
              />
              <span
                className={`w-5 h-0.5 bg-gray-800 block transition-all duration-300 mb-1.5 ${
                  menuOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`w-5 h-0.5 bg-gray-800 block transition-all duration-300 ${
                  menuOpen ? "-rotate-45 -translate-y-2" : ""
                }`}
              />
            </div>
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white text-gray-800 rounded-lg shadow-xl p-2 border border-gray-200 overflow-hidden transition-all duration-300">
              <ul className="space-y-1">
                {isLoggedIn ? (
                  <>
                    <li className="py-2 px-4 font-semibold text-indigo-700 border-b border-gray-200">
                      {username}
                    </li>
                    {isAdmin && (
                      <PremiumOnly
                        requiresPremium={true}
                        requiredPermissions={["ADMIN_PANEL"]}
                      >
                        <li>
                          <a
                            href="/admin/workers"
                            className="block py-2 px-4 text-gray-700 hover:bg-gray-100 rounded-md font-medium"
                            onClick={() => setMenuOpen(false)}
                          >
                            Admin Panel
                          </a>
                        </li>
                      </PremiumOnly>
                    )}
                    <li className="pt-2 mt-2 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="block py-2 px-4 w-full text-left text-gray-700 hover:bg-gray-100 rounded-md font-medium"
                      >
                        Logout
                      </button>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <a
                        href="/login"
                        className="block py-2 px-4 rounded-md text-gray-700 hover:bg-gray-100"
                        onClick={() => setMenuOpen(false)}
                      >
                        Login
                      </a>
                    </li>
                    <li>
                      <a
                        href="/register"
                        className="block py-2 px-4 text-center bg-gradient-to-r from-indigo-500 to-cyan-400 text-white rounded-md font-medium"
                        onClick={() => setMenuOpen(false)}
                      >
                        Sign Up
                      </a>
                    </li>
                  </>
                )}
              </ul>
            </div>
          )}
        </div>

        <nav className="hidden md:flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <span className="px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100">
                {username}
              </span>
              {isAdmin && (
                <PremiumOnly
                  requiresPremium={true}
                  requiredPermissions={["ADMIN_PANEL"]}
                >
                  <a
                    href="/admin/workers"
                    className="px-4 py-2 rounded-md border border-indigo-200 text-indigo-700 font-medium hover:bg-indigo-50 transition-colors"
                  >
                    Admin Panel
                  </a>
                </PremiumOnly>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="px-4 py-2 rounded-md border border-gray-200 text-gray-700 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 font-medium transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <a
                href="/login"
                className="px-4 py-2 rounded-md border border-gray-200 text-gray-700 font-medium hover:border-indigo-200 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
              >
                Login
              </a>
              <a
                href="/register"
                className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-cyan-400 text-white font-medium rounded-md shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
              >
                Sign Up
              </a>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default HeaderDashboard;
