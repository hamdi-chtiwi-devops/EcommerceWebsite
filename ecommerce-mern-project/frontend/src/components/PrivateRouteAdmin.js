import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

const PrivateRouteAdmin = () => {
  const { isAdminAuthenticated, adminUser } = useAdminAuth(); // adminUser can be used for loading state or role checks later
  const location = useLocation();

  // A simple way to check if context is still loading initial auth state (optional but good practice)
  // This assumes adminUser would be null until localStorage is checked by AdminAuthContext's useEffect.
  // However, our current AdminAuthContext initializes isAdminAuthenticated directly from localStorage,
  // so a distinct loading state might not be strictly necessary unless there's an async check.
  // For now, we'll rely on the initialized isAdminAuthenticated.
  // A more robust solution might involve a 'loading' state in AdminAuthContext.

  // If still determining auth status (e.g., from an async check which we don't have here yet)
  // you could return a loading spinner:
  // if (authContext.isLoading) {
  //   return <p>Loading authentication...</p>;
  // }


  if (!isAdminAuthenticated) {
    // Redirect them to the /admin/login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the admin dashboard.
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // If authenticated as admin, render the child routes
  return <Outlet />;
};

export default PrivateRouteAdmin;
