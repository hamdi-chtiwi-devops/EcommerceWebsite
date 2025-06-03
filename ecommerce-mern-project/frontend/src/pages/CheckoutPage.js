import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUserAuth } from '../context/UserAuthContext';
import { useCart } from '../context/CartContext';
import axios from 'axios'; // Added axios

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isUserAuthenticated, userToken } = useUserAuth(); // Added userToken
  const { cartItems, getCartSubtotal, clearCart } = useCart(); 

  const [currentStep, setCurrentStep] = useState(1); // 1: Shipping, 2: Payment, 3: Summary
  const [isPlacingOrder, setIsPlacingOrder] = useState(false); // Added
  const [placeOrderError, setPlaceOrderError] = useState(null); // Added
  
  const [shippingAddress, setShippingAddress] = useState(() => {
    const savedAddress = localStorage.getItem('shippingAddress');
    return savedAddress ? JSON.parse(savedAddress) : { address: '', city: '', postalCode: '', country: '' };
  });

  const [paymentMethod, setPaymentMethod] = useState(() => {
    return localStorage.getItem('paymentMethod') || 'PayPal'; // Default to PayPal
  });

  // Protect Route: User must be logged in and have cart items
  useEffect(() => {
    if (!isUserAuthenticated) {
      navigate('/login', { state: { from: location }, replace: true });
    } else if (cartItems.length === 0) {
      navigate('/cart', { replace: true }); // Or navigate to '/'
    }
  }, [isUserAuthenticated, cartItems, navigate, location]);

  // Persist shippingAddress and paymentMethod to localStorage
  useEffect(() => {
    localStorage.setItem('shippingAddress', JSON.stringify(shippingAddress));
  }, [shippingAddress]);

  useEffect(() => {
    localStorage.setItem('paymentMethod', paymentMethod);
  }, [paymentMethod]);

  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => prev - 1);

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));
  };

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    // Basic validation
    if (shippingAddress.address && shippingAddress.city && shippingAddress.postalCode && shippingAddress.country) {
      nextStep();
    } else {
      alert('Please fill in all shipping fields.');
    }
  };

  const handlePaymentChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    nextStep();
  };
  
  const itemsPrice = getCartSubtotal();
  // For now, hardcode tax and shipping. These could be calculated based on address or items.
  const shippingPrice = itemsPrice > 100 ? 0 : 10; // Example: free shipping over $100
  const taxPrice = itemsPrice * 0.15; // Example: 15% tax
  const totalPrice = itemsPrice + shippingPrice + taxPrice;

  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);
    setPlaceOrderError(null);

    const orderData = {
      orderItems: cartItems.map(item => ({
        name: item.name,
        qty: item.quantity,
        image: item.image || '/images/placeholder.png', // Default placeholder
        price: item.price,
        product: item._id, 
      })),
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    };

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
      };
      const { data: createdOrder } = await axios.post('/api/orders', orderData, config);
      
      clearCart();
      localStorage.removeItem('shippingAddress');
      // localStorage.removeItem('paymentMethod'); // Keep payment method for convenience? Optional.
      
      navigate(`/order/${createdOrder._id}`); // Navigate to the new order's detail page

    } catch (err) {
      setPlaceOrderError(err.response?.data?.message || err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };
  
  // --- Step Indicator ---
  const StepIndicator = () => (
    <div className="mb-8 w-full max-w-2xl mx-auto">
      <ol className="flex items-center w-full text-sm font-medium text-center text-gray-500">
        <li className={`flex md:w-full items-center ${currentStep >= 1 ? 'text-indigo-600' : ''} sm:after:content-[''] after:w-full after:h-1 after:border-b ${currentStep > 1 ? 'after:border-indigo-600' : 'after:border-gray-200'} after:border-1 after:hidden sm:after:inline-block after:mx-6 xl:after:mx-10`}>
          <span className={`flex items-center after:content-['/'] sm:after:hidden after:mx-2 after:text-gray-200 ${currentStep >= 1 ? 'text-indigo-600' : ''}`}>
            {currentStep > 1 ? <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20"><path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/></svg> : <span className="mr-2">1.</span>}
            Shipping
          </span>
        </li>
        <li className={`flex md:w-full items-center ${currentStep >= 2 ? 'text-indigo-600' : ''} sm:after:content-[''] after:w-full after:h-1 after:border-b ${currentStep > 2 ? 'after:border-indigo-600' : 'after:border-gray-200'} after:border-1 after:hidden sm:after:inline-block after:mx-6 xl:after:mx-10`}>
          <span className={`flex items-center after:content-['/'] sm:after:hidden after:mx-2 after:text-gray-200 ${currentStep >= 2 ? 'text-indigo-600' : ''}`}>
            {currentStep > 2 ? <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20"><path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/></svg> : <span className="mr-2">2.</span>}
            Payment
          </span>
        </li>
        <li className={`flex items-center ${currentStep === 3 ? 'text-indigo-600' : ''}`}>
          <span className="mr-2">3.</span> Summary
        </li>
      </ol>
    </div>
  );

  // --- Render Steps ---
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-200px)]">
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-8 text-center">Checkout</h1>
      <StepIndicator />

      <div className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-lg shadow-xl">
        {currentStep === 1 && (
          <form onSubmit={handleShippingSubmit}>
            <h2 className="text-2xl font-semibold mb-6 text-gray-700">Shipping Address</h2>
            {/* Address, City, Postal Code, Country Inputs */}
            <div className="space-y-4">
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address <span className="text-red-500">*</span></label>
                <input type="text" name="address" id="address" value={shippingAddress.address} onChange={handleShippingChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"/>
              </div>
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">City <span className="text-red-500">*</span></label>
                <input type="text" name="city" id="city" value={shippingAddress.city} onChange={handleShippingChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"/>
              </div>
              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">Postal Code <span className="text-red-500">*</span></label>
                <input type="text" name="postalCode" id="postalCode" value={shippingAddress.postalCode} onChange={handleShippingChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"/>
              </div>
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country <span className="text-red-500">*</span></label>
                <input type="text" name="country" id="country" value={shippingAddress.country} onChange={handleShippingChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"/>
              </div>
            </div>
            <div className="mt-8 text-right">
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-md transition duration-150">Continue to Payment</button>
            </div>
          </form>
        )}

        {currentStep === 2 && (
          <form onSubmit={handlePaymentSubmit}>
            <h2 className="text-2xl font-semibold mb-6 text-gray-700">Payment Method</h2>
            <div className="space-y-4">
              <div>
                <label className="flex items-center p-3 border border-gray-300 rounded-md hover:border-indigo-500 transition-colors">
                  <input type="radio" name="paymentMethod" value="PayPal" checked={paymentMethod === 'PayPal'} onChange={handlePaymentChange} className="h-5 w-5 text-indigo-600 focus:ring-indigo-500"/>
                  <span className="ml-3 text-sm font-medium text-gray-700">PayPal or Credit Card</span>
                </label>
              </div>
              <div>
                <label className="flex items-center p-3 border border-gray-300 rounded-md hover:border-indigo-500 transition-colors">
                  <input type="radio" name="paymentMethod" value="Stripe" checked={paymentMethod === 'Stripe'} onChange={handlePaymentChange} className="h-5 w-5 text-indigo-600 focus:ring-indigo-500"/>
                  <span className="ml-3 text-sm font-medium text-gray-700">Stripe</span>
                </label>
              </div>
              {/* Add more payment methods as needed */}
            </div>
            <div className="mt-8 flex justify-between">
              <button type="button" onClick={prevStep} className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-md transition duration-150">Back</button>
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-md transition duration-150">Continue to Summary</button>
            </div>
          </form>
        )}

        {currentStep === 3 && (
          <div>
            <h2 className="text-2xl font-semibold mb-6 text-gray-700">Order Summary</h2>
            <div className="space-y-6">
              {/* Shipping Details */}
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Shipping Address</h3>
                <p className="text-gray-600">{shippingAddress.address}</p>
                <p className="text-gray-600">{shippingAddress.city}, {shippingAddress.postalCode}</p>
                <p className="text-gray-600">{shippingAddress.country}</p>
              </div>
              {/* Payment Method */}
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Payment Method</h3>
                <p className="text-gray-600">{paymentMethod}</p>
              </div>
              {/* Order Items */}
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-3">Order Items</h3>
                <ul className="divide-y divide-gray-200 border-t border-b border-gray-200">
                  {cartItems.map(item => (
                    <li key={item._id} className="py-3 flex justify-between items-center">
                      <div className="flex items-center">
                        <img src={item.image || `https://via.placeholder.com/60?text=${item.name}`} alt={item.name} className="w-12 h-12 object-cover rounded-md mr-3"/>
                        <div>
                          <p className="font-medium text-gray-800">{item.name}</p>
                          <p className="text-sm text-gray-500">Qty: {item.qty}</p>
                        </div>
                      </div>
                      <p className="text-gray-700 font-medium">${(item.price * item.qty).toFixed(2)}</p>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Price Breakdown */}
              <div className="space-y-1 border-t border-gray-200 pt-4">
                <div className="flex justify-between text-sm text-gray-600"><p>Items Subtotal:</p><p>${itemsPrice.toFixed(2)}</p></div>
                <div className="flex justify-between text-sm text-gray-600"><p>Shipping:</p><p>${shippingPrice.toFixed(2)}</p></div>
                <div className="flex justify-between text-sm text-gray-600"><p>Tax (15%):</p><p>${taxPrice.toFixed(2)}</p></div>
                <div className="flex justify-between text-lg font-bold text-gray-800 mt-2"><p>Order Total:</p><p>${totalPrice.toFixed(2)}</p></div>
              </div>
              {placeOrderError && (
                <div className="mt-4 p-3 text-sm text-red-700 bg-red-100 border border-red-400 rounded-md">
                  {placeOrderError}
                </div>
              )}
            </div>
            <div className="mt-8 flex flex-col sm:flex-row justify-between gap-4">
              <button type="button" onClick={prevStep} disabled={isPlacingOrder} className="w-full sm:w-auto bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-md transition duration-150 disabled:opacity-50">Back</button>
              <button 
                type="button" 
                onClick={handlePlaceOrder} 
                disabled={isPlacingOrder || cartItems.length === 0}
                className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-md transition duration-150 disabled:opacity-50"
              >
                {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;
