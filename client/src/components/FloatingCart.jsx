import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const FloatingCart = () => {
  const {
    cartItems,
    isCartOpen,
    toggleCartDrawer,
    updateQuantity,
    removeFromCart,
    totalAmount,
  } = useCart();
  const navigate = useNavigate();
  const [isBounce, setIsBounce] = useState(false);

  // Bounce animation when items are added
  useEffect(() => {
    if (cartItems.length > 0) {
      setIsBounce(true);
      const timer = setTimeout(() => setIsBounce(false), 300);
      return () => clearTimeout(timer);
    }
  }, [cartItems.length]);

  if (cartItems.length === 0) return null;

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={toggleCartDrawer}
        className={`fixed bottom-24 right-4 z-50 bg-primary text-white p-4 rounded-full shadow-hard flex items-center justify-center transition-transform hover:scale-110 active:scale-95 ${
          isBounce ? "animate-bounce" : ""
        }`}
      >
        <div className="relative">
          <span className="text-2xl">🛒</span>
          <span className="absolute -top-3 -right-3 bg-red-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-white">
            {cartItems.reduce((total, item) => total + item.quantity, 0)}
          </span>
        </div>
      </button>

      {/* Cart Drawer Overlay */}
      {isCartOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-fade-in"
          onClick={toggleCartDrawer}
        ></div>
      )}

      {/* Cart Drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-5 border-b dark:border-gray-800 flex justify-between items-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-10">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              🛒 Giỏ hàng{" "}
              <span className="text-primary">({cartItems.length})</span>
            </h2>
            <button
              onClick={toggleCartDrawer}
              className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              ✕
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.food_id}
                className="flex gap-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-sm transition-all animate-slide-in-right"
              >
                <img
                  src={item.image_url || "https://via.placeholder.com/80"}
                  alt={item.name}
                  className="w-20 h-20 rounded-lg object-cover bg-gray-200"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2 text-sm">
                      {item.name}
                    </h3>
                    <button
                      onClick={() => removeFromCart(item.food_id)}
                      className="text-gray-400 hover:text-red-500 transition"
                    >
                      🗑️
                    </button>
                  </div>
                  <p className="text-primary font-bold text-sm mb-3">
                    {item.price.toLocaleString()}đ
                  </p>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-lg w-max border border-gray-200 dark:border-gray-700 p-1">
                    <button
                      onClick={() => updateQuantity(item.food_id, -1)}
                      className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold"
                    >
                      -
                    </button>
                    <span className="text-sm font-bold w-4 text-center text-gray-900 dark:text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.food_id, 1)}
                      className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer - Total & Action */}
          <div className="p-5 border-t dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky bottom-0 z-10">
            <div className="flex justify-between items-end mb-4">
              <span className="text-gray-500 dark:text-gray-400 font-medium">
                Tổng cộng
              </span>
              <span className="text-2xl font-black text-primary">
                {totalAmount.toLocaleString()}đ
              </span>
            </div>
            <button
              onClick={() => {
                toggleCartDrawer();
                navigate("/checkout");
              }}
              className="w-full py-4 bg-primary hover:bg-primary-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-primary/30 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              Thanh toán ngay <span className="text-xl">→</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default FloatingCart;
