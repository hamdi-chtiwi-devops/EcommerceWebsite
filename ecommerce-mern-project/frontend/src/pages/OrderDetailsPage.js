import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useUserAuth } from '../context/UserAuthContext'; // To get userToken and check auth status

const OrderDetailsPage = () => {
  const { id: orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { userToken, isUserAuthenticated } = useUserAuth();

  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPaying, setIsPaying] = useState(false); // Added
  const [payError, setPayError] = useState(null); // Added

  const fetchOrderDetails = useCallback(async () => {
    // setError(null); // Clear previous main error before fetching
    // setPayError(null); // Clear previous pay error before fetching
    if (!orderId) {
      setError('Order ID is missing.');
      setIsLoading(false);
      return;
    }
    if (!userToken) { // Should ideally be caught by a ProtectedRoute component if this page is protected
      setError('You must be logged in to view this page.');
      setIsLoading(false);
      navigate('/login', { state: { from: location }, replace: true });
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      };
      const { data } = await axios.get(`/api/orders/${orderId}`, config);
      setOrder(data);
    } catch (err) {
      if (err.response) {
        setError(err.response.data.message || 'Failed to fetch order details.');
      } else {
        setError(err.message || 'An unexpected error occurred.');
      }
      setOrder(null);
    } finally {
      setIsLoading(false);
    }
  }, [orderId, userToken, navigate, location]);

  useEffect(() => {
    if (!isUserAuthenticated && !userToken) { // Redirect if not logged in
        navigate('/login', { state: { from: location }, replace: true });
        return;
    }
    // Fetch order details if user is authenticated or token is present
    // (token check handles cases where context might not have updated isUserAuthenticated instantly after login)
    if (userToken) {
        fetchOrderDetails();
    }
  }, [orderId, userToken, isUserAuthenticated, fetchOrderDetails, navigate, location]);


  if (isLoading) {
    return (
      <div className="container mx-auto p-8 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-xl text-gray-700">Loading order details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8 text-center">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-6 rounded-md shadow-md max-w-md mx-auto">
          <p className="font-bold text-xl">Error</p>
          <p className="mt-2">{error}</p>
          <Link to={isUserAuthenticated ? "/myorders" : "/"} className="mt-4 inline-block bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition-colors">
            {isUserAuthenticated ? "Back to My Orders" : "Back to Home"}
          </Link>
        </div>
      </div>
    );
  }

  if (!order) {
    return <div className="container mx-auto p-8 text-center text-gray-600 text-xl">Order not found or details are unavailable.</div>;
  }

  const handlePayOrder = async () => {
    if (!order || !order.user) { // Ensure order and order.user are loaded
        setPayError("Order details not fully loaded yet. Please wait and try again.");
        return;
    }
    setIsPaying(true);
    setPayError(null);
    try {
      const mockPaymentResult = {
        id: 'mock_pyid_' + Date.now(),
        status: 'COMPLETED',
        update_time: new Date().toISOString(),
        // Use order.user.email if populated, otherwise a fallback from user context or hardcoded
        email_address: order.user.email || (isUserAuthenticated ? 'user@example.com' : 'guest@example.com'),
      };

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
      };

      await axios.put(`/api/orders/${orderId}/pay`, mockPaymentResult, config);
      // Re-fetch order details to get updated status
      await fetchOrderDetails(); 
      // Success message can be implied by UI change or add a temporary success state if needed

    } catch (err) {
      setPayError(err.response?.data?.message || err.message || 'Payment failed. Please try again.');
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">Order Details</h1>
      <p className="text-sm text-gray-500 mb-1">Order ID: <span className="font-mono">{order._id}</span></p>
      <p className="text-sm text-gray-500 mb-6">
        Placed on: {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Shipping, Payment, Delivery Status */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-700 mb-3">Shipping Address</h2>
            <address className="text-gray-600 not-italic">
              <p>{order.shippingAddress.address}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
              <p>{order.shippingAddress.country}</p>
            </address>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-700 mb-3">Payment Information</h2>
            <p className="text-gray-600">Method: {order.paymentMethod}</p>
            {order.isPaid ? (
              <p className="text-green-600 font-semibold mt-1">
                Paid on: {new Date(order.paidAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            ) : (
              <p className="text-red-600 font-semibold mt-1">Not Paid</p>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-700 mb-3">Delivery Status</h2>
            {order.isDelivered ? (
              <p className="text-green-600 font-semibold">
                Delivered on: {new Date(order.deliveredAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            ) : (
              <p className="text-orange-600 font-semibold">Not Delivered</p>
            )}
          </div>
        </div>

        {/* Right Column: Order Items and Summary */}
        <div className="md:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Order Items</h2>
            <ul className="divide-y divide-gray-200">
              {order.orderItems.map(item => (
                <li key={item.product || item._id} className="py-4 flex items-center gap-4"> {/* Use item._id if item.product is not available in some cart items (should be) */}
                  <img 
                    src={item.image || `https://via.placeholder.com/80?text=${item.name}`} 
                    alt={item.name} 
                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-md border border-gray-200"
                  />
                  <div className="flex-grow">
                    <Link to={`/product/${item.product}`} className="font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
                      {item.name}
                    </Link>
                    <p className="text-sm text-gray-500">
                      {item.qty} x ${item.price.toFixed(2)} = ${(item.qty * item.price).toFixed(2)}
                    </p>
                  </div>
                  <p className="text-md font-semibold text-gray-700 whitespace-nowrap">${(item.qty * item.price).toFixed(2)}</p>
                </li>
              ))}
            </ul>
            
            <div className="mt-6 border-t border-gray-200 pt-6 space-y-2">
              <div className="flex justify-between text-md"><span className="text-gray-600">Items Price:</span> <span className="font-medium text-gray-800">${order.itemsPrice.toFixed(2)}</span></div>
              <div className="flex justify-between text-md"><span className="text-gray-600">Shipping:</span> <span className="font-medium text-gray-800">${order.shippingPrice.toFixed(2)}</span></div>
              <div className="flex justify-between text-md"><span className="text-gray-600">Tax:</span> <span className="font-medium text-gray-800">${order.taxPrice.toFixed(2)}</span></div>
              <div className="flex justify-between text-xl font-bold text-gray-900 mt-2"><p>Order Total:</p><p>${order.totalPrice.toFixed(2)}</p></div>
            </div>
          </div>

          {!order.isPaid && (
            <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-700 mb-3">Payment Required</h2>
              <p className="text-gray-600 mb-4">This order is not yet paid. Proceed to payment to complete your purchase.</p>
              
              {payError && (
                <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 border border-red-400 rounded-md">
                  {payError}
                </div>
              )}

              <button 
                type="button"
                onClick={handlePayOrder}
                disabled={isPaying}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isPaying ? 'Processing Payment...' : `Pay Now with ${order.paymentMethod}`}
              </button>
            </div>
          )}
        </div>
      </div>
       <div className="mt-8 text-center">
          <Link to="/myorders" className="text-indigo-600 hover:text-indigo-800 transition-colors">
            &larr; Back to My Orders
          </Link>
        </div>
    </div>
  );
};

export default OrderDetailsPage;
