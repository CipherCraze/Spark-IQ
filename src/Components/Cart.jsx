import React, { useState } from "react";

export default function Cart() {
  const initialCartItems = [
    { id: 1, name: "Item 1", price: 20.0, quantity: 1 },
    { id: 2, name: "Item 2", price: 15.0, quantity: 1 },
    { id: 3, name: "Item 3", price: 30.0, quantity: 1 },
  ];

  const [cartItems, setCartItems] = useState(initialCartItems);

  const updateQuantity = (id, quantity) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );
  };

  const removeItem = (id) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="container max-w-3xl px-6 py-12 mx-auto bg-gray-800 rounded-lg shadow-lg">
      <h1 className="mb-6 text-3xl font-bold text-center text-white">Your Cart</h1>
      
      <div className="space-y-6">
        {cartItems.length === 0 ? (
          <p className="text-lg text-center text-gray-400">Your cart is empty.</p>
        ) : (
          cartItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between px-6 py-4 bg-gray-700 rounded-md shadow-sm">
              <div className="flex items-center space-x-4">
                <span className="text-lg font-medium text-white">{item.name}</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="px-2 py-1 text-sm font-semibold text-gray-300 bg-gray-600 rounded hover:bg-gray-500"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={item.quantity}
                    min="1"
                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                    className="w-12 text-center text-white bg-gray-800 border border-gray-600 rounded"
                  />
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="px-2 py-1 text-sm font-semibold text-gray-300 bg-gray-600 rounded hover:bg-gray-500"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-lg font-semibold text-white">
                  ${item.price * item.quantity}
                </span>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
        
        <div className="pt-4 mt-6 border-t border-gray-600">
          <div className="text-xl font-semibold text-white">
            Total: ${total.toFixed(2)}
          </div>
          <div className="flex justify-end mt-4 space-x-4">
            <button
              onClick={() => alert("Proceeding to checkout...")}
              className="px-6 py-2 text-white transition duration-300 bg-green-600 rounded-md hover:bg-green-700"
            >
              Checkout
            </button>
            <button
              onClick={() => alert("Continue shopping...")}
              className="px-6 py-2 text-gray-300 transition duration-300 border border-gray-600 rounded-md hover:bg-gray-600"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
