import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  // A default placeholder image URL or logic to construct one
  const imageUrl = product.image && product.image !== '/images/sample.jpg' 
    ? product.image 
    : "https://via.placeholder.com/300x200.png?text=No+Image"; // More descriptive placeholder

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out flex flex-col">
      <div className="w-full h-48 bg-gray-100 flex items-center justify-center mb-3 overflow-hidden rounded-md">
        <img 
            src={imageUrl} 
            alt={product.name || "Product image"} 
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            onError={(e) => { e.target.onerror = null; e.target.src="https://via.placeholder.com/300x200.png?text=Error+Loading"; }} // Fallback for broken image links
        />
      </div>
      <div className="flex-grow">
        <h3 
            className="text-lg font-semibold text-gray-800 mb-1 truncate" 
            title={product.name}
        >
            {product.name || 'Unnamed Product'}
        </h3>
        <p className="text-xl font-bold text-indigo-600 mb-3">
            ${product.price ? product.price.toFixed(2) : 'N/A'}
        </p>
      </div>
      <Link 
        to={`/product/${product._id}`} 
        className="block w-full text-center bg-indigo-500 text-white py-2 px-4 rounded-md hover:bg-indigo-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
      >
        View Details
      </Link>
    </div>
  );
};

export default ProductCard;
