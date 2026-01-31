import React, { createContext, useState, useContext, useEffect } from "react";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [restaurantId, setRestaurantId] = useState(null); // Ensure items are from same restaurant
  const [isCartOpen, setIsCartOpen] = useState(false);

  const toggleCartDrawer = () => setIsCartOpen(!isCartOpen);

  // Load cart from local storage on init
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    const savedResId = localStorage.getItem("cart_restaurant_id");
    if (savedCart) setCartItems(JSON.parse(savedCart));
    if (savedResId) setRestaurantId(savedResId);
  }, []);

  // Save cart to local storage on change
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
    if (restaurantId) localStorage.setItem("cart_restaurant_id", restaurantId);
    else localStorage.removeItem("cart_restaurant_id");
  }, [cartItems, restaurantId]);

  const addToCart = (product, restaurant_id) => {
    // Check if adding from a different restaurant
    if (restaurantId && restaurantId !== restaurant_id) {
      if (
        !window.confirm(
          "Start a new basket? Adding items from a new restaurant will clear your current basket.",
        )
      ) {
        return;
      }
      setCartItems([]);
    }

    setRestaurantId(restaurant_id);

    setCartItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => item.food_id === product.food_id,
      );
      if (existingItem) {
        return prevItems.map((item) =>
          item.food_id === product.food_id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      } else {
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (foodId) => {
    setCartItems((prevItems) => {
      const newItems = prevItems.filter((item) => item.food_id !== foodId);
      if (newItems.length === 0) setRestaurantId(null);
      return newItems;
    });
  };

  const updateQuantity = (foodId, delta) => {
    setCartItems((prevItems) => {
      return prevItems.map((item) => {
        if (item.food_id === foodId) {
          return { ...item, quantity: Math.max(1, item.quantity + delta) };
        }
        return item;
      });
    });
  };

  const clearCart = () => {
    setCartItems([]);
    setRestaurantId(null);
    localStorage.removeItem("cart");
    localStorage.removeItem("cart_restaurant_id");
  };

  const setCart = (newItems, newRestaurantId) => {
    setCartItems(newItems);
    setRestaurantId(newRestaurantId);
    setIsCartOpen(true);
  };

  const totalAmount = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        restaurantId,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        setCart,
        totalAmount,
        isCartOpen,
        toggleCartDrawer,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
