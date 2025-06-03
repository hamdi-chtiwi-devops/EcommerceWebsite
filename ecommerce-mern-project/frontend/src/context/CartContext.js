import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const localData = localStorage.getItem('cartItems');
      return localData ? JSON.parse(localData) : [];
    } catch (error) {
      console.error("Error parsing cartItems from localStorage:", error);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity) => {
    if (!product || !product._id || quantity <= 0) {
      console.error("Invalid product or quantity provided to addToCart");
      return; // Or throw an error
    }

    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item._id === product._id);
      let newQuantity = quantity;

      if (existingItem) {
        newQuantity = existingItem.quantity + quantity;
        if (newQuantity > product.countInStock) {
          newQuantity = product.countInStock; // Cap at available stock
          // Optionally: alert user that quantity was adjusted
          console.warn(`Quantity for ${product.name} capped at ${product.countInStock} due to stock limits.`);
        }
        return prevItems.map(item =>
          item._id === product._id
            ? { ...item, quantity: newQuantity }
            : item
        );
      } else {
        if (newQuantity > product.countInStock) {
          newQuantity = product.countInStock;
          console.warn(`Quantity for ${product.name} capped at ${product.countInStock} due to stock limits.`);
        }
        // Ensure only necessary product details are added to cart
        const productDetailsForCart = {
            _id: product._id,
            name: product.name,
            price: product.price,
            image: product.image || '/images/placeholder.jpg', // Ensure image placeholder
            countInStock: product.countInStock, 
        };
        return [...prevItems, { ...productDetailsForCart, quantity: newQuantity }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item._id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId); // Or set to 1, depending on desired UX
      return;
    }
    setCartItems(prevItems =>
      prevItems.map(item => {
        if (item._id === productId) {
          let newQuantity = quantity;
          if (newQuantity > item.countInStock) {
            newQuantity = item.countInStock;
            console.warn(`Quantity for ${item.name} capped at ${item.countInStock} due to stock limits.`);
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartCount = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  const getCartSubtotal = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cartItems]);

  return (
    <CartContext.Provider value={{ 
        cartItems, 
        addToCart, 
        removeFromCart, 
        updateQuantity, 
        clearCart, 
        getCartCount, 
        getCartSubtotal 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
