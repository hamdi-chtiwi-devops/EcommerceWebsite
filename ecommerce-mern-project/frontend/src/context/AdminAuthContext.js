import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [adminToken, setAdminToken] = useState(localStorage.getItem('adminToken'));
  const [adminUser, setAdminUser] = useState(() => {
    const storedUser = localStorage.getItem('adminUser');
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Error parsing adminUser from localStorage:", error);
      return null;
    }
  });

  // Initialize isAdminAuthenticated based on token and user being admin
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    const token = localStorage.getItem('adminToken');
    const user = JSON.parse(localStorage.getItem('adminUser') || 'null'); // Handle null string
    return !!token && user?.isAdmin === true;
  });

  useEffect(() => {
    if (adminToken && adminUser?.isAdmin) {
      localStorage.setItem('adminToken', adminToken);
      localStorage.setItem('adminUser', JSON.stringify(adminUser));
      setIsAdminAuthenticated(true);
      // Set Authorization header for axios requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`;
    } else {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      setIsAdminAuthenticated(false);
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [adminToken, adminUser]);

  const adminLogin = async (email, password) => {
    try {
      // Temporarily remove global auth header for login request
      const tempAxios = axios.create();
      delete tempAxios.defaults.headers.common['Authorization'];

      const { data } = await tempAxios.post('/api/auth/login', { email, password });
      
      if (data && data.token && data.user && data.user.isAdmin === true) {
        setAdminToken(data.token);
        setAdminUser(data.user);
        // The useEffect will handle localStorage and isAdminAuthenticated update
        return data.user; 
      } else {
        // If login is successful but user is not admin, or response is malformed
        adminLogout(); // Clear any potentially partially set state
        throw new Error(data.message || 'Login failed or user is not an administrator.');
      }
    } catch (error) {
      adminLogout(); // Ensure cleanup on any error
      // Prioritize error message from backend if available
      throw new Error(error.response?.data?.message || error.message || 'An error occurred during admin login.');
    }
  };

  const adminLogout = () => {
    setAdminToken(null);
    setAdminUser(null);
    // State updates will trigger useEffect to clear localStorage and isAdminAuthenticated
    // Navigation should be handled by the component calling logout
  };

  return (
    <AdminAuthContext.Provider value={{ adminToken, adminUser, isAdminAuthenticated, adminLogin, adminLogout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
