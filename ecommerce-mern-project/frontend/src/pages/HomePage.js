import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard'; // Adjusted path if ProductCard is in components

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get('/api/products');
        setProducts(response.data || []);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load products.');
        setProducts([]); // Clear products on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []); // Empty dependency array means this runs once on component mount

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-8 text-center">
        Featured Products
      </h1>

      {isLoading && (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading products...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-6 rounded-md shadow-md text-center" role="alert">
          <p className="font-semibold">Oops! Something went wrong.</p>
          <p>{error}</p>
        </div>
      )}

      {!isLoading && !error && products.length === 0 && (
        <div className="text-center py-10">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No Products Found</h3>
          <p className="mt-1 text-sm text-gray-500">
            There are currently no products available. Please check back later.
          </p>
        </div>
      )}

      {!isLoading && !error && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;
