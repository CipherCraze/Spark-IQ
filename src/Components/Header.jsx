// Header.jsx
import { useState, useEffect } from "react";
import { SparklesIcon } from "@heroicons/react/24/outline";
import { Link, useNavigate } from "react-router";
import { motion } from "framer-motion";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navigationLinks = [
    { name: "Home", path: "/" },
    { name: "Pricing", path: "/pricing" },
    { name: "How It Works", path: "/how-it-works" },
    { name: "Support", path: "/support" },
    { name: "Team", path: "/team" },
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-gray-900 shadow-xl" : "bg-gray-900/95 backdrop-blur-md"
      }`}
    >
      <div className="container flex items-center justify-between px-6 py-4 mx-auto">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <SparklesIcon className="w-8 h-8 text-indigo-400" />
          <span className="text-2xl font-bold text-white">
            SPARK<span className="text-indigo-400">IQ</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="items-center hidden space-x-8 md:flex">
          {navigationLinks.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className="relative font-medium text-gray-300 text-sm hover:text-indigo-400 transition-colors after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-px after:bg-indigo-400 hover:after:w-full after:transition-all"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="items-center hidden space-x-4 md:flex">
          <Link
            to="/login"
            className="px-4 py-2 font-medium text-gray-300 transition-colors hover:text-indigo-400"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="px-4 py-2 font-medium text-white transition-colors bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-gray-300 transition-colors md:hidden hover:text-indigo-400"
        >
          {isMobileMenuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          isMobileMenuOpen ? "max-h-96" : "max-h-0"
        }`}
      >
        <nav className="px-6 pb-4 space-y-4 bg-gray-800/95 backdrop-blur-sm">
          {navigationLinks.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 text-gray-300 transition-colors border-b border-gray-700 hover:text-indigo-400 last:border-0"
            >
              {item.name}
            </Link>
          ))}
          <div className="pt-4 space-y-4 border-t border-gray-700">
            <Link
              to="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block w-full py-2 text-center text-gray-300 transition-colors hover:text-indigo-400"
            >
              Login
            </Link>
            <Link
              to="/signup"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block w-full py-2 font-medium text-center text-white transition-colors bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}