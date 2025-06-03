import React from 'react';
import React from 'react'; // Ensured React is imported
import { Link, useNavigate } from 'react-router-dom';
import { useUserAuth } from '../context/UserAuthContext';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useCart } from '../context/CartContext'; // Added

const Layout = ({ children }) => {
  const navigate = useNavigate();

  const { isUserAuthenticated, currentUser, userLogout } = useUserAuth();
  const { isAdminAuthenticated, adminUser, adminLogout } // Assuming adminUser might be useful later
    = useAdminAuth();
  const { getCartCount } = useCart(); // Added
  const cartItemCount = getCartCount(); // Added

  const handleUserLogout = () => {
    userLogout();
    navigate('/login');
  };

  const handleAdminLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="bg-indigo-700 text-white shadow-lg">
        <div className="container mx-auto flex justify-between items-center p-4">
          <Link to="/" className="text-2xl font-bold hover:text-indigo-200 transition-colors">
            eCommercePro
          </Link>
          
          <nav className="flex items-center space-x-4 sm:space-x-6">
            <Link to="/cart" className="hover:text-indigo-200 transition-colors px-3 py-2 rounded-md text-sm font-medium relative">
                Cart
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                    {cartItemCount}
                  </span>
                )}
            </Link>

            {isAdminAuthenticated ? (
              <>
                <Link 
                  to="/admin" 
                  className="hover:text-indigo-200 transition-colors px-3 py-2 rounded-md text-sm font-medium"
                >
                  Admin Dashboard
                </Link>
                <button 
                  onClick={handleAdminLogout} 
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Admin Logout
                </button>
              </>
            ) : isUserAuthenticated ? (
              <>
                <Link 
                  to="/myorders" // Changed from /profile
                  className="hover:text-indigo-200 transition-colors px-3 py-2 rounded-md text-sm font-medium"
                >
                  {currentUser?.name ? `${currentUser.name.split(' ')[0]}'s Orders` : 'My Orders'}
                </Link>
                <button 
                  onClick={handleUserLogout} 
                  className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="hover:text-indigo-200 transition-colors px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
      
      <footer className="bg-gray-800 text-white p-6 text-center">
        <p>&copy; {new Date().getFullYear()} eCommercePro. All rights reserved.</p>
        {/* Add more footer content if needed */}
      </footer>
    </div>
  );
};

export default Layout;
