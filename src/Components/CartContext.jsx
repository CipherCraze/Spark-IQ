// CartContext.jsx
import React, { createContext, useContext, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product) => {
    setCartItems((prevItems) => {
      // Check if the product is already in the cart
      const index = prevItems.findIndex((item) => item.id === product.id);
      if (index !== -1) {
        // Increase the quantity if it exists
        const updatedItems = [...prevItems];
        updatedItems[index].quantity += 1;
        return updatedItems;
      }
      // Otherwise, add it as a new item with quantity 1
      return [...prevItems, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  // Calculate the total count (summing quantities)
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, cartCount }}>
      {children}
    </CartContext.Provider>
  );
}

// Custom hook for using the cart context
export function useCart() {
  return useContext(CartContext);
}
