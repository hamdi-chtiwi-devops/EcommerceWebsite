import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAdminAuth } from '../../context/AdminAuthContext';

const AdminCategoryManagementPage = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // For adding a new category
  const [newCategoryName, setNewCategoryName] = useState('');

  // For editing a category
  const [editingCategory, setEditingCategory] = useState(null); // { _id: string, name: string }
  const [editFormName, setEditFormName] = useState('');

  const { adminToken } = useAdminAuth();

  const getConfig = useCallback(() => {
    return {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    };
  }, [adminToken]);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await axios.get('/api/categories'); // Public route, no token needed
      setCategories(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch categories.');
      setCategories([]); // Clear categories on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleNewCategoryChange = (e) => {
    setNewCategoryName(e.target.value);
    setError(''); // Clear error when user types
    setSuccessMessage('');
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      setError('Category name cannot be empty.');
      return;
    }
    setIsLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      await axios.post('/api/categories', { name: newCategoryName.trim() }, getConfig());
      setNewCategoryName('');
      setSuccessMessage(`Category "${newCategoryName.trim()}" added successfully!`);
      fetchCategories(); // Refresh list
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to add category.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (category) => {
    setEditingCategory(category);
    setEditFormName(category.name);
    setError('');
    setSuccessMessage('');
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setEditFormName('');
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!editingCategory || !editFormName.trim()) {
      setError('Category name cannot be empty for update.');
      return;
    }
    setIsLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      await axios.put(`/api/categories/${editingCategory._id}`, { name: editFormName.trim() }, getConfig());
      setEditingCategory(null);
      setEditFormName('');
      setSuccessMessage(`Category updated to "${editFormName.trim()}" successfully!`);
      fetchCategories(); // Refresh list
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update category.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId, categoryName) => {
    if (window.confirm(`Are you sure you want to delete the category "${categoryName}"?`)) {
      setIsLoading(true);
      setError('');
      setSuccessMessage('');
      try {
        await axios.delete(`/api/categories/${categoryId}`, getConfig());
        setSuccessMessage(`Category "${categoryName}" deleted successfully!`);
        fetchCategories(); // Refresh list
        if (editingCategory?._id === categoryId) { // If deleting the category being edited
            handleCancelEdit();
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to delete category.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Category Management</h1>

      {/* Add Category Form */}
      <form onSubmit={handleAddCategory} className="mb-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Add New Category</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={newCategoryName}
            onChange={handleNewCategoryChange}
            placeholder="Enter category name"
            className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-md transition duration-150 ease-in-out disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading && !editingCategory ? 'Adding...' : 'Add Category'}
          </button>
        </div>
      </form>

      {/* Display Messages */}
      {error && <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 border border-red-400 rounded-md">{error}</div>}
      {successMessage && <div className="mb-4 p-3 text-sm text-green-700 bg-green-100 border border-green-400 rounded-md">{successMessage}</div>}

      {/* Categories List */}
      <div className="bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold p-6 border-b border-gray-200 text-gray-700">Existing Categories</h2>
        {isLoading && categories.length === 0 && <p className="p-6 text-gray-500">Loading categories...</p>}
        {!isLoading && categories.length === 0 && !error && (
          <p className="p-6 text-gray-500">No categories found. Add some above!</p>
        )}
        
        <ul className="divide-y divide-gray-200">
          {categories.map((category) => (
            <li key={category._id} className="p-4 sm:p-6">
              {editingCategory?._id === category._id ? (
                <form onSubmit={handleUpdateCategory} className="flex flex-col sm:flex-row items-center gap-3">
                  <input
                    type="text"
                    value={editFormName}
                    onChange={(e) => setEditFormName(e.target.value)}
                    className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    disabled={isLoading}
                  />
                  <div className="flex gap-2 mt-2 sm:mt-0">
                    <button
                      type="submit"
                      className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md text-sm transition duration-150 ease-in-out disabled:opacity-50"
                      disabled={isLoading}
                    >
                      {isLoading && editingCategory?._id === category._id ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md text-sm transition duration-150 ease-in-out"
                      disabled={isLoading}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col sm:flex-row justify-between items-center">
                  <span className="text-gray-800 text-lg mb-2 sm:mb-0">{category.name}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditClick(category)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-1 px-3 rounded-md text-sm transition duration-150 ease-in-out disabled:opacity-50"
                      disabled={isLoading || editingCategory} // Disable if any edit is active or general loading
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category._id, category.name)}
                      className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-3 rounded-md text-sm transition duration-150 ease-in-out disabled:opacity-50"
                      disabled={isLoading || editingCategory} // Disable if any edit is active or general loading
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AdminCategoryManagementPage;
