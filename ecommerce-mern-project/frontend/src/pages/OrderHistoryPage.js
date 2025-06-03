import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useUserAuth } from '../context/UserAuthContext';

const OrderHistoryPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userToken, isUserAuthenticated } = useUserAuth();

  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserOrders = useCallback(async () => {
    if (!userToken) {
      // This case should ideally be handled by the useEffect checking isUserAuthenticated first,
      // but as a safeguard if token disappears for some reason.
      setIsLoading(false);
      setError("Authentication token not found. Please log in.");
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
      const { data } = await axios.get('/api/orders/myorders', config);
      setOrders(data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch orders.');
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [userToken, navigate, location]);

  useEffect(() => {
    if (!isUserAuthenticated) {
      navigate('/login', { state: { from: location }, replace: true });
    } else if (userToken) { // Ensure token exists before fetching
      fetchUserOrders();
    } else if (!userToken && isUserAuthenticated) {
        // Edge case: context says authenticated but token is gone, prompt re-login
        setError("Your session might have expired. Please log in again.");
        setIsLoading(false);
        // Potentially call userLogout() here if accessible to clear context state fully
    }
  }, [isUserAuthenticated, userToken, fetchUserOrders, navigate, location]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-8 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-xl text-gray-700">Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8 text-center">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-6 rounded-md shadow-md max-w-md mx-auto">
          <p className="font-bold text-xl">Error</p>
          <p className="mt-2">{error}</p>
          <Link to="/" className="mt-4 inline-block bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition-colors">
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto p-8 text-center">
         <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        </svg>
        <h2 className="mt-6 text-2xl font-semibold text-gray-700">You have no orders yet.</h2>
        <p className="mt-2 text-gray-500">All your future orders will appear here.</p>
        <Link 
          to="/" 
          className="mt-6 inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-transform transform hover:scale-105"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-8">My Orders</h1>
      <div className="bg-white shadow-xl rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivered</th>
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">Details</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map(order => (
              <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-700" title={order._id}>
                  {order._id.substring(0,12)}... {/* Shorten for display */}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-semibold">
                  ${order.totalPrice.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {order.isPaid ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Paid on {new Date(order.paidAt).toLocaleDateString()}
                    </span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      Not Paid
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {order.isDelivered ? (
                     <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      Delivered on {new Date(order.deliveredAt).toLocaleDateString()}
                    </span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Not Delivered
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link to={`/order/${order._id}`} className="text-indigo-600 hover:text-indigo-900 transition-colors px-3 py-1 rounded-md border border-indigo-600 hover:bg-indigo-50">
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderHistoryPage;
