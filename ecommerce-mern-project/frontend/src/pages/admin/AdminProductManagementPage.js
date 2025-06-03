import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAdminAuth } from '../../context/AdminAuthContext';

const initialProductState = {
  name: '',
  price: '',
  category: '',
  countInStock: '',
  brand: '',
  description: '',
  // image: '', // Will handle later
};

const AdminProductManagementPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  
  const [isLoading, setIsLoading] = useState(false); // For initial data loading
  const [isSubmitting, setIsSubmitting] = useState(false); // For form submissions
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [showProductForm, setShowProductForm] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(initialProductState);
  const [isEditing, setIsEditing] = useState(false);

  const { adminToken } = useAdminAuth();

  const getConfig = useCallback(() => {
    return {
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
    };
  }, [adminToken]);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/products'); // Public, no token needed
      setProducts(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch products.');
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    // Assuming categories are less likely to change frequently during a session on this page,
    // could add logic to only fetch if categories.length === 0
    try {
      const response = await axios.get('/api/categories'); // Public
      setCategories(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch categories for form.');
      setCategories([]);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentProduct(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccessMessage('');
  };

  const handleShowAddForm = () => {
    setIsEditing(false);
    setCurrentProduct(initialProductState);
    setShowProductForm(true);
    setError('');
    setSuccessMessage('');
  };

  const handleEditClick = (product) => {
    setIsEditing(true);
    // Ensure category is just the ID if backend populated it as an object
    const categoryId = product.category?._id || product.category;
    setCurrentProduct({ ...product, category: categoryId });
    setShowProductForm(true);
    setError('');
    setSuccessMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to form
  };

  const handleCancelForm = () => {
    setShowProductForm(false);
    setCurrentProduct(initialProductState);
    setIsEditing(false);
    setError('');
    setSuccessMessage('');
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    // Basic Validation
    if (!currentProduct.name || !currentProduct.price || !currentProduct.category || !currentProduct.countInStock || !currentProduct.description) {
      setError('Please fill in all required fields: Name, Price, Category, Count in Stock, Description.');
      return;
    }
    if (isNaN(parseFloat(currentProduct.price)) || isNaN(parseInt(currentProduct.countInStock))) {
        setError('Price and Count in Stock must be valid numbers.');
        return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    const productData = {
        ...currentProduct,
        price: parseFloat(currentProduct.price),
        countInStock: parseInt(currentProduct.countInStock),
    };

    try {
      if (isEditing) {
        // Update Product
        await axios.put(`/api/products/${currentProduct._id}`, productData, getConfig());
        setSuccessMessage(`Product "${productData.name}" updated successfully!`);
      } else {
        // Add Product
        await axios.post('/api/products', productData, getConfig());
        setSuccessMessage(`Product "${productData.name}" added successfully!`);
      }
      setShowProductForm(false);
      setCurrentProduct(initialProductState);
      setIsEditing(false);
      fetchProducts(); // Refresh product list
    } catch (err) {
      setError(err.response?.data?.message || err.message || `Failed to ${isEditing ? 'update' : 'add'} product.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (productId, productName) => {
    if (window.confirm(`Are you sure you want to delete the product "${productName}"?`)) {
      setIsSubmitting(true); // Use isSubmitting to disable buttons during delete
      setError('');
      setSuccessMessage('');
      try {
        await axios.delete(`/api/products/${productId}`, getConfig());
        setSuccessMessage(`Product "${productName}" deleted successfully!`);
        fetchProducts(); // Refresh product list
        if (showProductForm && isEditing && currentProduct._id === productId) {
            handleCancelForm(); // If deleting the product currently in edit form
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to delete product.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  // --- Render Logic ---
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Product Management</h1>

      {/* Action Buttons & Messages */}
      <div className="mb-6">
        {!showProductForm && (
          <button
            onClick={handleShowAddForm}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md transition duration-150 ease-in-out"
          >
            Add New Product
          </button>
        )}
        {error && <div className="mt-4 p-3 text-sm text-red-700 bg-red-100 border border-red-400 rounded-md">{error}</div>}
        {successMessage && <div className="mt-4 p-3 text-sm text-green-700 bg-green-100 border border-green-400 rounded-md">{successMessage}</div>}
      </div>

      {/* Product Form (Add/Edit) */}
      {showProductForm && (
        <form onSubmit={handleSubmitProduct} className="mb-8 p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </h2>
          
          {/* Form Fields: Name, Price, Category, CountInStock, Brand, Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name <span className="text-red-500">*</span></label>
              <input type="text" name="name" id="name" value={currentProduct.name} onChange={handleInputChange} required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
            </div>
            {/* Price */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price <span className="text-red-500">*</span></label>
              <input type="number" name="price" id="price" value={currentProduct.price} onChange={handleInputChange} required step="0.01"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
            </div>
            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category <span className="text-red-500">*</span></label>
              <select name="category" id="category" value={currentProduct.category} onChange={handleInputChange} required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
            {/* Count in Stock */}
            <div>
              <label htmlFor="countInStock" className="block text-sm font-medium text-gray-700">Count In Stock <span className="text-red-500">*</span></label>
              <input type="number" name="countInStock" id="countInStock" value={currentProduct.countInStock} onChange={handleInputChange} required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
            </div>
            {/* Brand */}
            <div>
              <label htmlFor="brand" className="block text-sm font-medium text-gray-700">Brand</label>
              <input type="text" name="brand" id="brand" value={currentProduct.brand} onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
            </div>
          </div>
          {/* Description */}
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description <span className="text-red-500">*</span></label>
            <textarea name="description" id="description" value={currentProduct.description} onChange={handleInputChange} required rows="4"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
          </div>
          
          {/* Form Buttons */}
          <div className="flex justify-end gap-4">
            <button type="button" onClick={handleCancelForm} disabled={isSubmitting}
              className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md transition duration-150 ease-in-out disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md transition duration-150 ease-in-out disabled:opacity-50">
              {isSubmitting ? (isEditing ? 'Saving...' : 'Adding...') : (isEditing ? 'Save Changes' : 'Add Product')}
            </button>
          </div>
        </form>
      )}

      {/* Products List Table */}
      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <h2 className="text-xl font-semibold p-6 border-b border-gray-200 text-gray-700">Existing Products</h2>
        {isLoading && <p className="p-6 text-gray-500">Loading products...</p>}
        {!isLoading && !error && products.length === 0 && (
          <p className="p-6 text-gray-500">No products found. Add some using the form above!</p>
        )}
        {!isLoading && products.length > 0 && (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">In Stock</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category?.name || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${typeof product.price === 'number' ? product.price.toFixed(2) : '0.00'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.countInStock}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.brand || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button onClick={() => handleEditClick(product)} disabled={isSubmitting || (showProductForm && isEditing)}
                      className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50 disabled:cursor-not-allowed">Edit</button>
                    <button onClick={() => handleDeleteProduct(product._id, product.name)} disabled={isSubmitting || (showProductForm && isEditing)}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminProductManagementPage;
