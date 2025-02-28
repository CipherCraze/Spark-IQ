import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router";
import { CartProvider } from "./Components/CartContext";
import Header from "./Components/Header";
import Hero from "./Components/LandingPage/Hero";
import HotDeals from "./Components/LandingPage/HotDeals";
import Features from "./Components/LandingPage/Features";
import Testimonials from "./Components/LandingPage/Testimonials";
import CTA from "./Components/LandingPage/CTA";
import Footer from "./Components/LandingPage/Footer";
import HowItWorks from "./Components/HowItWorks";
import Products from "./Components/Products";
import Sell from "./Components/Sell";
import Profile from "./Components/Profile";
import Login from "./Components/Login";
import Signup from "./Components/Signup";
import About from "./Components/About";
import Support from "./Components/Support";
import Cart from "./Components/Cart";
import Auction from "./Components/LiveAuctionsPage";
import Loader from './Components/Loader'; // Import the Loader component

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // Adjust the delay as needed

    return () => clearTimeout(timer);
  }, []);

  return (
    <CartProvider>
      <Router>
        {/* Show only the Loader while loading */}
        {isLoading ? (
          <Loader />
        ) : (
          // Render the entire app content after loading is complete
          <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
            {/* Header Component */}
            <Header />

            {/* Main Content */}
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Hero />} />
                <Route path="/hot-deals" element={<HotDeals />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/products" element={<Products />} />
                <Route path="/sell" element={<Sell />} />
                <Route path="/auction" element={<Auction />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/about" element={<About />} />
                <Route path="/support" element={<Support />} />
                <Route path="/cart" element={<Cart />} />
              </Routes>

              {/* Additional Sections for Landing Page */}
              <HotDeals />
              <Features />
              <Testimonials />
              <CTA />
            </main>

            {/* Footer Section */}
            <Footer />
          </div>
        )}
      </Router>
    </CartProvider>
  );
}

export default App;