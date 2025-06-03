import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminLoginPage from './pages/AdminLoginPage';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { UserAuthProvider } from './context/UserAuthContext';
import { CartProvider } from './context/CartContext'; // Added
import PrivateRouteAdmin from './components/PrivateRouteAdmin';
import AdminDashboardPage from './pages/AdminDashboardPage'; // This is the layout
import AdminOverviewPage from './pages/admin/AdminOverviewPage';
import AdminCategoryManagementPage from './pages/admin/AdminCategoryManagementPage';
import AdminProductManagementPage from './pages/admin/AdminProductManagementPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import OrderHistoryPage from './pages/OrderHistoryPage'; // Added OrderHistoryPage import
import './index.css'; // Ensure Tailwind is imported (already there from previous step)

function App() {
  return (
    <Router>
      <CartProvider> {/* CartProvider is outermost */}
        <UserAuthProvider>
          <AdminAuthProvider>
            <Layout>
              <Routes>
                <Route path="/" element={<HomePage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order/:id" element={<OrderDetailsPage />} />
            <Route path="/myorders" element={<OrderHistoryPage />} /> {/* Added OrderHistoryPage route */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Public Admin Login Route */}
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Protected Admin Routes */}
          <Route element={<PrivateRouteAdmin />}>
            <Route path="/admin" element={<AdminDashboardPage />}>
              <Route index element={<AdminOverviewPage />} /> 
              <Route path="categories" element={<AdminCategoryManagementPage />} />
              <Route path="products" element={<AdminProductManagementPage />} />
              {/* Future:
              <Route path="orders" element={<AdminOrdersPage />} />
              <Route path="users" element={<AdminUsersPage />} /> 
              */}
            </Route>
          </Route>
        </Routes>
            </Layout>
          </AdminAuthProvider>
        </UserAuthProvider>
      </CartProvider>
    </Router>
  );
}
export default App;
