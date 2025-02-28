// product.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  StarIcon,
  ShoppingCartIcon,
  EyeIcon,
  ArrowsPointingOutIcon,
} from "@heroicons/react/24/solid";
import { useCart } from "./CartContext"; // Adjust the import path as needed

import rogStrix from "./assets/images/rogstrixscar18.png";
import razerMouse from "./assets/images/razerdeathaddermouse.png";
import logitechHeadset from "./assets/images/logitechgamingheadset.png";
import chronosWatch from "./assets/images/chronossmartwatch.png";

const Products = () => {
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Get addToCart from our cart context
  const { addToCart, cartItems } = useCart();

  const products = [
    {
      id: 1,
      name: "ASUS ROG Strix Scar 18",
      description: "16-core processor, 4K OLED display, 32GB RAM, 1TB SSD",
      image: rogStrix,
      price: 2499,
      rating: 4.8,
      category: "computers",
      tags: ["Popular", "New Arrival"],
    },
    {
      id: 2,
      name: "Razer DeathAdder Mouse",
      description:
        "Ergonomic design, 8000 DPI, RGB lighting, 6 programmable buttons",
      image: razerMouse,
      price: 79,
      rating: 4.5,
      category: "accessories",
      tags: ["Best Seller"],
    },
    {
      id: 3,
      name: "Logitech Gaming Headset",
      description: "Active noise cancellation, 40hr battery, Hi-Res audio",
      image: logitechHeadset,
      price: 349,
      rating: 4.9,
      category: "audio",
      tags: ["Premium"],
    },
    {
      id: 4,
      name: "Chronos Smart Watch",
      description: "Health monitoring, GPS, Always-on Retina display",
      image: chronosWatch,
      price: 399,
      rating: 4.7,
      category: "wearables",
      tags: ["Sale", "Limited Edition"],
    },
  ];

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (selectedCategory === "all" || product.category === selectedCategory)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <br />
      {/* Floating Cart Counter */}
      <motion.div
        className="fixed z-50 flex items-center gap-2 px-4 py-2 mt-20 text-white bg-purple-600 rounded-full top-4 right-4"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
      >
        <ShoppingCartIcon className="w-5 h-5" />
        <span>{cartItems.reduce((acc, item) => acc + item.quantity, 0)}</span>
      </motion.div>

      {/* Hero Section */}
      <div className="container px-4 py-16 mx-auto text-center">
        <motion.h1
          className="mb-6 text-5xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          Campus Marketplace
        </motion.h1>

        {/* Search and Filters */}
        <div className="max-w-2xl mx-auto mb-12 space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search tech products..."
              className="w-full px-6 py-3 bg-gray-800 border border-gray-700 rounded-full focus:outline-none focus:border-purple-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {["all", "computers", "accessories", "audio", "wearables"].map(
              (cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full capitalize ${
                    selectedCategory === cat
                      ? "bg-purple-600 text-white"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  {cat}
                </button>
              )
            )}
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex justify-end gap-2 mb-8">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg ${
              viewMode === "grid" ? "bg-purple-600" : "bg-gray-800"
            }`}
          >
            <ArrowsPointingOutIcon className="w-6 h-6" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg ${
              viewMode === "list" ? "bg-purple-600" : "bg-gray-800"
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Products Grid/List */}
        <div
          className={`grid gap-8 ${
            viewMode === "grid"
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              : "grid-cols-1"
          }`}
        >
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`group relative ${
                viewMode === "grid"
                  ? "bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition-all"
                  : "bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition-all flex items-center gap-6"
              }`}
            >
              {/* Product Image */}
              <motion.div
                className={`relative overflow-hidden ${
                  viewMode === "grid" ? "h-64 mb-4" : "h-48 w-48 flex-shrink-0"
                }`}
                whileHover={{ scale: 1.05 }}
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="object-cover w-full h-full rounded-lg"
                />
                {/* Product Tags */}
                <div className="absolute flex gap-2 top-2 left-2">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-xs font-bold bg-purple-600 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>

              {/* Product Info */}
              <div className={`${viewMode === "list" ? "flex-grow" : ""}`}>
                <h3 className="mb-2 text-2xl font-bold text-purple-400">
                  {product.name}
                </h3>
                <p className="mb-4 text-gray-400">{product.description}</p>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(product.rating)
                            ? "fill-current"
                            : "fill-gray-700"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-gray-400">({product.rating})</span>
                </div>

                {/* Price and Actions */}
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold text-purple-500">
                    ${product.price}
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => addToCart(product)}
                      className="flex items-center gap-2 px-6 py-3 transition-colors bg-purple-600 rounded-lg hover:bg-purple-700"
                    >
                      <ShoppingCartIcon className="w-5 h-5" />
                      <span>Add to Cart</span>
                    </button>
                    <button
                      onClick={() => setQuickViewProduct(product)}
                      className="p-3 bg-gray-700 rounded-lg hover:bg-gray-600"
                    >
                      <EyeIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick View Modal */}
        {quickViewProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <motion.div
              className="w-full max-w-2xl p-8 mx-4 bg-gray-800 rounded-xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <div className="flex items-start justify-between mb-6">
                <h2 className="text-3xl font-bold text-purple-400">
                  {quickViewProduct.name}
                </h2>
                <button
                  onClick={() => setQuickViewProduct(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <img
                  src={quickViewProduct.image}
                  alt={quickViewProduct.name}
                  className="object-cover w-full h-64 rounded-lg"
                />
                <div>
                  <p className="mb-4 text-gray-300">
                    {quickViewProduct.description}
                  </p>
                  <div className="mb-4 text-2xl font-bold text-purple-500">
                    ${quickViewProduct.price}
                  </div>
                  <button
                    onClick={() => {
                      addToCart(quickViewProduct);
                      setQuickViewProduct(null);
                    }}
                    className="flex items-center justify-center w-full gap-2 py-3 transition-colors bg-purple-600 rounded-lg hover:bg-purple-700"
                  >
                    <ShoppingCartIcon className="w-5 h-5" />
                    Add to Cart
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
