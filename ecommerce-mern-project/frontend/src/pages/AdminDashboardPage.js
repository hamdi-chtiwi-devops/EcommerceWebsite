import React from 'react';
import { Link, Outlet, useNavigate, NavLink } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

const AdminDashboardPage = () => {
  const { adminLogout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login'); 
  };

  const commonLinkClasses = "block px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-150";
  const activeLinkClasses = "bg-gray-900 text-white";

  return (
    <div className="flex h-[calc(100vh-64px)]"> {/* Assuming header is 64px */}
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white p-4 space-y-2 flex flex-col">
        <h2 className="text-xl font-semibold mb-4">Admin Menu</h2>
        <nav className="flex-grow">
          <NavLink 
            to="/admin" 
            end // Important for index routes or parent paths
            className={({ isActive }) => `${commonLinkClasses} ${isActive ? activeLinkClasses : ''}`}
          >
            Overview
          </NavLink>
          <NavLink 
            to="/admin/categories" 
            className={({ isActive }) => `${commonLinkClasses} ${isActive ? activeLinkClasses : ''}`}
          >
            Categories
          </NavLink>
          <NavLink 
            to="/admin/products" 
            className={({ isActive }) => `${commonLinkClasses} ${isActive ? activeLinkClasses : ''}`}
          >
            Products
          </NavLink>
          <NavLink 
            to="#" // Placeholder
            className={({ isActive }) => `${commonLinkClasses} ${isActive ? activeLinkClasses : ''} opacity-50 cursor-not-allowed`}
          >
            Orders
          </NavLink>
          <NavLink 
            to="#" // Placeholder
            className={({ isActive }) => `${commonLinkClasses} ${isActive ? activeLinkClasses : ''} opacity-50 cursor-not-allowed`}
          >
            Users
          </NavLink>
        </nav>
        <div className="mt-auto">
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors duration-150"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 bg-gray-100 overflow-y-auto">
        <Outlet /> 
      </main>
    </div>
  );
};

export default AdminDashboardPage;
