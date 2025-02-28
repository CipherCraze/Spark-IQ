import { Link } from "react-router"; // Import Link from React Router
import { ArrowRight } from "lucide-react";
import { ShieldCheckIcon, UserGroupIcon, SparklesIcon } from "@heroicons/react/24/outline";

export default function Hero() {
  return (
    <header className="relative flex items-center justify-center min-h-screen overflow-hidden bg-gray-900">
      {/* Gradient Mesh Background */}
      <div className="absolute inset-0 opacity-95">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/80 via-gray-900 to-slate-900/90"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-indigo-900/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 px-6 mx-auto max-w-7xl lg:px-8">
        <div className="text-center">
          {/* Pre-header Badge */}
          <div className="inline-flex items-center mb-8 space-x-3 px-4 py-2.5 bg-indigo-500/10 rounded-full border border-indigo-500/30">
            <span className="text-sm font-semibold text-indigo-400">Now serving 50+ campuses nationwide</span>
          </div>

          {/* Main Heading */}
          <h1 className="max-w-4xl mx-auto font-serif text-5xl font-medium leading-tight text-white text-balance md:text-6xl lg:text-7xl">
            The Premier Marketplace for
            <span className="text-transparent bg-gradient-to-r from-indigo-300 to-blue-400 bg-clip-text">
              {" "}Academic Communities
            </span>
          </h1>

          {/* Subheading */}
          <p className="max-w-2xl mx-auto mt-8 text-xl font-light leading-relaxed text-gray-300">
            Facilitate secure transactions, connect with verified peers, and elevate your campus commerce experience
            through our institutional-grade trading platform.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-6 mt-12 sm:flex-row">
            {/* Link the List Your Items button to the Sell page */}
            <Link
              to="/sell" // Update this to point to the sell.jsx page
              className="relative flex items-center justify-center gap-3 px-8 py-4 text-lg font-medium text-white transition-all rounded-lg shadow-xl group bg-gradient-to-br from-indigo-600 to-blue-600 hover:shadow-2xl hover:brightness-105"
            >
              <span>List Your Items</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              <div className="absolute inset-0 transition-opacity border rounded-lg opacity-0 border-indigo-300/30 group-hover:opacity-100"></div>
            </Link>

            {/* Link the Explore Marketplace button to the Login page */}
            <Link
              to="/login"
              className="flex items-center justify-center gap-3 px-8 py-4 text-lg font-medium text-white transition-all border border-gray-600 rounded-lg bg-gray-800/50 backdrop-blur-lg hover:border-indigo-400 hover:bg-indigo-500/10"
            >
              <span>Explore Marketplace</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-8 mt-16 text-gray-400">
            <div className="flex items-center gap-3">
              <ShieldCheckIcon className="w-6 h-6 text-emerald-400" />
              <span className="text-sm">SSL Encrypted Transactions</span>
            </div>
            <div className="flex items-center gap-3">
              <UserGroupIcon className="w-6 h-6 text-blue-400" />
              <span className="text-sm">50,000+ Verified Users</span>
            </div>
            <div className="flex items-center gap-3">
              <SparklesIcon className="w-6 h-6 text-purple-400" />
              <span className="text-sm">Award-Winning Platform</span>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Grid Pattern */}
      <div className="absolute inset-0 opacity-20 [mask-image:linear-gradient(180deg,transparent,rgba(0,0,0,0.8))]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M0 40L40 0" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
    </header>
  );
}
