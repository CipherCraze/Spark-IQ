// Header.jsx
import { useState, useEffect } from "react";
import { ShoppingCart, Search, Menu, X, User } from "lucide-react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { useCart } from "./CartContext"; // Adjust the path if needed

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const navigate = useNavigate();

  // Get cart data and functions from context (make sure these functions exist)
  const { cartItems, cartCount, removeFromCart, updateQuantity, clearCart } = useCart();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navigationLinks = [
    { name: "Home", path: "/" },
    { name: "Products", path: "/products" },
    { name: "Special Offers", path: "/hotdeals" },
    { name: "Auctions", path: "/auction" },
    { name: "How It Works", path: "/how-it-works" },
    { name: "Sell", path: "/sell" },
    { name: "About", path: "/about" },
    { name: "Support", path: "/support" },
  ];

  // Calculate the subtotal of the cart
  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-gray-900 shadow-xl" : "bg-gray-900/95 backdrop-blur-md"
      }`}
      role="banner"
    >
      <div className="container flex items-center justify-between px-6 py-4 mx-auto">
        {/* Logo */}
        <a
          href="/"
          onClick={() => window.scrollTo(0, 0)}
          className="text-2xl font-bold text-blue-400 transition-colors hover:text-blue-300"
        >
          CAMPUS<span className="text-gray-100">MART</span>
        </a>

        {/* Desktop Navigation */}
        <nav className="items-center hidden space-x-8 md:flex">
          {navigationLinks.map((item) => (
            <a
              key={item.name}
              href={item.path}
              onClick={() => window.scrollTo(0, 0)}
              className="relative font-medium text-gray-300 uppercase text-sm hover:text-blue-400 transition-colors after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-px after:bg-blue-400 hover:after:w-full after:transition-all"
            >
              {item.name}
            </a>
          ))}
        </nav>

        {/* Action Icons */}
        <div className="items-center hidden space-x-6 md:flex">
          <div className="relative group">
            <input
              type="search"
              placeholder="Search products..."
              className="w-56 px-4 py-2 text-gray-300 transition-all bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30"
            />
            <Search className="absolute right-3 top-2.5 w-5 h-5 text-gray-400 group-focus-within:text-blue-400" />
          </div>

          {/* Enhanced Cart Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 text-gray-300 transition-all duration-300 transform bg-gray-800 rounded-full group hover:scale-110 hover:shadow-lg hover:bg-gradient-to-br hover:from-blue-500 hover:to-blue-700"
          >
            <ShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full -top-2 -right-2 group-hover:animate-bounce">
                {cartCount}
              </span>
            )}
          </button>

          <a
            href="/profile"
            onClick={() => window.scrollTo(0, 0)}
            className="text-gray-300 transition-colors hover:text-blue-400"
          >
            <User className="w-6 h-6" />
          </a>

          <a
            href="/login"
            onClick={() => window.scrollTo(0, 0)}
            className="px-4 py-2 font-medium text-gray-900 transition-colors bg-blue-400 border-2 border-transparent rounded-lg hover:bg-blue-300 hover:border-blue-400/30"
          >
            Login
          </a>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-gray-300 transition-colors md:hidden hover:text-blue-400"
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? (
            <X className="w-7 h-7" />
          ) : (
            <Menu className="w-7 h-7" />
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
            <a
              key={item.name}
              href={item.path}
              onClick={() => {
                setIsMobileMenuOpen(false);
                window.scrollTo(0, 0);
              }}
              className="block py-2 text-gray-300 transition-colors border-b border-gray-700 hover:text-blue-400 last:border-0"
            >
              {item.name}
            </a>
          ))}
          <div className="pt-4 space-y-4 border-t border-gray-700">
            <input
              type="search"
              placeholder="Search..."
              className="w-full px-4 py-2 text-gray-300 bg-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <a
              href="/login"
              onClick={() => {
                setIsMobileMenuOpen(false);
                window.scrollTo(0, 0);
              }}
              className="block w-full py-2 font-medium text-center text-gray-900 transition-colors bg-blue-400 rounded-lg hover:bg-blue-300"
            >
              Sign In
            </a>
          </div>
        </nav>
      </div>

      {/* Cart Sidebar */}
      {isCartOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed inset-0 bg-black/50 z-[60]"
        >
          <div className="absolute top-0 right-0 w-full h-full max-w-md p-6 transition-transform bg-gray-900 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-blue-400">
                Your Cart ({cartCount})
              </h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="text-gray-400 transition-colors hover:text-blue-400"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="text-gray-300">
              {cartItems.length === 0 ? (
                <p className="py-4 text-center">Your cart is empty</p>
              ) : (
                <ul className="space-y-4">
                  {cartItems.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between pb-2 border-b border-gray-700"
                    >
                      <div>
                        <span className="block font-medium">
                          {item.name}
                        </span>
                        <div className="flex items-center mt-1 space-x-2">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="px-2 py-1 text-xs font-bold text-gray-900 transition-colors bg-gray-700 rounded hover:bg-gray-600"
                          >
                            −
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="px-2 py-1 text-xs font-bold text-gray-900 transition-colors bg-gray-700 rounded hover:bg-gray-600"
                          >
                            +
                          </button>
                        </div>
                        <span className="block mt-1 text-sm text-gray-400">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-sm text-red-500 hover:text-red-400"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Cart Summary & Actions */}
            {cartItems.length > 0 && (
              <div className="mt-8 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium text-gray-300">
                    Subtotal:
                  </span>
                  <span className="text-lg font-bold text-blue-400">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate("/login");
                  }}
                  className="w-full px-4 py-2 font-medium text-gray-900 transition-colors bg-blue-400 rounded-lg hover:bg-blue-300"
                >
                  Checkout
                </button>
                <button
                  onClick={() => clearCart()}
                  className="w-full px-4 py-2 font-medium text-gray-300 transition-colors bg-red-700 rounded-lg hover:bg-red-600"
                >
                  Clear Cart
                </button>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="w-full px-4 py-2 font-medium text-gray-300 transition-colors bg-gray-800 rounded-lg hover:bg-gray-700"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </header>
  );
}
