import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FaTrashAlt, FaPlus, FaMinus } from 'react-icons/fa'; // Using react-icons for +/-/trash

const CartPage = () => {
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    getCartSubtotal 
  } = useCart();
  const navigate = useNavigate();

  const handleQuantityChange = (productId, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;
    // updateQuantity in context already handles quantity < 1 (removes item) 
    // and respects countInStock.
    updateQuantity(productId, newQuantity);
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your entire cart?')) {
      clearCart();
    }
  };
  
  const handleProceedToCheckout = () => {
    // Later, navigate to a real checkout page
    navigate('/checkout'); // Assuming /checkout will be the route
    console.log("Proceeding to checkout with items:", cartItems);
  };

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="container mx-auto p-8 text-center">
        <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h2 className="mt-6 text-2xl font-semibold text-gray-700">Your cart is empty.</h2>
        <p className="mt-2 text-gray-500">Looks like you haven't added anything to your cart yet.</p>
        <Link 
          to="/" 
          className="mt-6 inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-transform transform hover:scale-105"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  const subtotal = getCartSubtotal();

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-8">Your Shopping Cart</h1>
      
      <div className="lg:flex lg:gap-8">
        {/* Cart Items List */}
        <div className="lg:w-2/3">
          <ul className="space-y-6">
            {cartItems.map(item => (
              <li key={item._id} className="bg-white p-4 sm:p-6 rounded-lg shadow-md flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                <Link to={`/product/${item._id}`} className="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32">
                  <img 
                    src={item.image || `https://via.placeholder.com/150?text=${item.name}`} 
                    alt={item.name} 
                    className="w-full h-full object-cover rounded-md border border-gray-200"
                  />
                </Link>
                <div className="flex-grow text-center sm:text-left">
                  <Link to={`/product/${item._id}`} className="text-lg sm:text-xl font-semibold text-indigo-700 hover:text-indigo-800 transition-colors">
                    {item.name}
                  </Link>
                  <p className="text-sm text-gray-500 mt-1">Price: ${item.price.toFixed(2)}</p>
                </div>
                <div className="flex-shrink-0 flex flex-col items-center sm:items-end gap-2">
                  <div className="flex items-center border border-gray-300 rounded-md">
                    <button 
                      onClick={() => handleQuantityChange(item._id, item.quantity, -1)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-l-md focus:outline-none"
                      aria-label="Decrease quantity"
                    >
                      <FaMinus />
                    </button>
                    <span className="px-4 py-1 text-md font-medium text-gray-700 tabular-nums">{item.quantity}</span>
                    <button 
                      onClick={() => handleQuantityChange(item._id, item.quantity, 1)}
                      disabled={item.quantity >= item.countInStock}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-r-md focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Increase quantity"
                    >
                      <FaPlus />
                    </button>
                  </div>
                  <p className="text-md font-semibold text-gray-800">
                    Total: ${(item.price * item.quantity).toFixed(2)}
                  </p>
                  <button 
                    onClick={() => removeFromCart(item._id)} 
                    className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors flex items-center gap-1"
                    aria-label="Remove item"
                  >
                    <FaTrashAlt /> Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Cart Summary */}
        <div className="lg:w-1/3 mt-8 lg:mt-0">
          <div className="bg-white p-6 rounded-lg shadow-md sticky top-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-4">Order Summary</h2>
            <div className="flex justify-between items-center mb-4 text-lg">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-bold text-gray-800">${subtotal.toFixed(2)}</span>
            </div>
            {/* Add more summary details like Taxes, Shipping later if needed */}
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between items-center mb-6 text-xl">
                <span className="text-gray-600 font-semibold">Grand Total:</span>
                <span className="font-extrabold text-indigo-700">${subtotal.toFixed(2)}</span>
              </div>
              <button 
                onClick={handleProceedToCheckout}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
              >
                Proceed to Checkout
              </button>
              <button 
                onClick={handleClearCart}
                className="w-full mt-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
