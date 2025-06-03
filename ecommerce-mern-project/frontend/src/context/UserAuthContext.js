import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const UserAuthContext = createContext(null);

export const UserAuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(localStorage.getItem('userToken'));
  const [currentUser, setCurrentUser] = useState(() => {
    const storedUser = localStorage.getItem('currentUser');
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Error parsing currentUser from localStorage:", error);
      return null;
    }
  });
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(!!userToken);

  const setAxiosAuthHeader = useCallback((token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, []);

  useEffect(() => {
    if (userToken && currentUser) { // Only set if both token and user are present
      localStorage.setItem('userToken', userToken);
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      setIsUserAuthenticated(true);
      // Assuming user login should take precedence or be distinct from admin
      // This will overwrite admin token if admin logs out and user logs in or vice-versa
      setAxiosAuthHeader(userToken); 
    } else {
      localStorage.removeItem('userToken');
      localStorage.removeItem('currentUser');
      setIsUserAuthenticated(false);
      // Potentially clear header if current global token was this user's
      // This needs careful handling if admin and user tokens can co-exist or if one logs out
      // For now, if user logs out, clear the header.
      // A better approach might be to check if the current axios default token IS userToken before deleting.
      if (axios.defaults.headers.common['Authorization'] === `Bearer ${userToken}`) { // Check if it's this user's token
          delete axios.defaults.headers.common['Authorization'];
      }
    }
  }, [userToken, currentUser, setAxiosAuthHeader]);

  const userRegister = async (name, email, password) => {
    try {
      // Use a temporary axios instance if worried about global headers, or ensure global is clear
      const tempAxios = axios.create(); // Fresh instance
      const response = await tempAxios.post('/api/auth/register', { name, email, password });
      if (response.status === 201 && response.data.token && response.data.user) {
        setUserToken(response.data.token);
        setCurrentUser(response.data.user);
        // useEffect will handle localStorage and setting isAuthenticated
        return response.data;
      } else {
        throw new Error(response.data.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      // Clear any partial state if registration fails
      // setUserToken(null); setCurrentUser(null); // This would trigger useEffect to clear storage
      throw new Error(error.response?.data?.message || error.message || 'An error occurred during registration.');
    }
  };

  const userLogin = async (email, password) => {
    try {
      const tempAxios = axios.create(); // Fresh instance
      const response = await tempAxios.post('/api/auth/login', { email, password });
      if (response.data.token && response.data.user) {
        // Do not log in admins as regular users through this flow
        if (response.data.user.isAdmin) {
          // Log out any admin that might be partially logged in here
          // adminLogout(); // if you had access to adminLogout
          throw new Error('Admin accounts should log in through the admin portal.');
        }
        setUserToken(response.data.token);
        setCurrentUser(response.data.user);
        return response.data;
      } else {
        throw new Error(response.data.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      // setUserToken(null); setCurrentUser(null);
      throw new Error(error.response?.data?.message || error.message || 'An error occurred during login.');
    }
  };

  const userLogout = () => {
    setUserToken(null);
    setCurrentUser(null);
    // useEffect will clear localStorage and update isAuthenticated.
    // It also clears axios default header if it was this user's token.
  };

  return (
    <UserAuthContext.Provider value={{ userToken, currentUser, isUserAuthenticated, userRegister, userLogin, userLogout }}>
      {children}
    </UserAuthContext.Provider>
  );
};

export const useUserAuth = () => {
  const context = useContext(UserAuthContext);
  if (context === undefined) {
    throw new Error('useUserAuth must be used within a UserAuthProvider');
  }
  return context;
};
