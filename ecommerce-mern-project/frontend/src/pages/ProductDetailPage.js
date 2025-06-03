import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext'; // Added

const ProductDetailPage = () => {
  const { id: productId } = useParams(); // Rename id to productId for clarity
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1); // Added
  const [addToCartSuccess, setAddToCartSuccess] = useState(false); // Added for feedback

  const { addToCart } = useCart(); // Added

  useEffect(() => {
    // Reset success message when product changes
    setAddToCartSuccess(false);
    if (!productId) {
      setError('Product ID is missing.');
      setIsLoading(false);
      return;
    }

    const fetchProductDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get(`/api/products/${productId}`);
        setProduct(response.data);
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setError('Product not found.');
        } else {
          setError(err.response?.data?.message || err.message || 'Failed to load product details.');
        }
        setProduct(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId]);

  // Image placeholder logic
  const getImageUrl = () => {
    if (product && product.image && product.image !== '/images/sample.jpg') {
      return product.image;
    }
    return `https://via.placeholder.com/600x400.png?text=${product?.name || 'Product Image'}`;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-8 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-xl text-gray-700">Loading product details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8 text-center">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-6 rounded-md shadow-md max-w-md mx-auto">
          <p className="font-bold text-xl">Error</p>
          <p className="mt-2">{error}</p>
          <Link to="/" className="mt-4 inline-block bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition-colors">
            Go Back Home
          </Link>
        </div>
      </div>
    );
  }

  if (!product) {
    // This case should ideally be covered by error state if product not found,
    // but as a fallback:
    return <div className="container mx-auto p-8 text-center text-gray-600 text-xl">Product details are not available.</div>;
  }

  const categoryName = product.category ? (product.category.name || product.category) : 'N/A';
  const stockStatus = product.countInStock > 0 
    ? `In Stock (${product.countInStock} available)` 
    : "Out of Stock";
  const stockColor = product.countInStock > 0 ? "text-green-600" : "text-red-600";

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (value >= 1 && value <= (product?.countInStock || 1)) {
      setSelectedQuantity(value);
    } else if (value < 1) {
      setSelectedQuantity(1);
    } else if (product?.countInStock) {
      setSelectedQuantity(product.countInStock);
    }
  };

  const handleAddToCart = () => {
    if (product && product.countInStock > 0 && selectedQuantity > 0) {
      // Ensure product object passed to addToCart has all necessary fields
      // (especially _id, name, price, image, countInStock)
      const productForCart = {
        _id: product._id,
        name: product.name,
        price: product.price,
        image: product.image || getImageUrl(), // Use getImageUrl if product.image is basic
        countInStock: product.countInStock,
      };
      addToCart(productForCart, selectedQuantity);
      setAddToCartSuccess(true);
      setTimeout(() => setAddToCartSuccess(false), 3000); // Hide message after 3s
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <Link to="/" className="text-indigo-600 hover:text-indigo-800 transition-colors">
          &larr; Back to Products
        </Link>
      </div>
      <div className="flex flex-col lg:flex-row gap-8 bg-white p-6 rounded-lg shadow-xl">
        {/* Image Section */}
        <div className="lg:w-1/2">
          <div className="w-full h-80 sm:h-96 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
            <img 
              src={getImageUrl()} 
              alt={product.name} 
              className="w-full h-full object-contain" // object-contain to see full image, object-cover for fill
              onError={(e) => { e.target.onerror = null; e.target.src=`https://via.placeholder.com/600x400.png?text=Error+Loading`; }}
            />
          </div>
        </div>

        {/* Details Section */}
        <div className="lg:w-1/2 flex flex-col justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3">{product.name}</h1>
            <p className="text-gray-500 text-sm mb-2">
              Category: <span className="text-gray-700 font-medium">{categoryName}</span>
            </p>
            {product.brand && (
              <p className="text-gray-500 text-sm mb-4">
                Brand: <span className="text-gray-700 font-medium">{product.brand}</span>
              </p>
            )}
            <p className="text-gray-700 mb-6 leading-relaxed">{product.description}</p>
            
            <p className={`text-2xl font-bold mb-1 ${stockColor}`}>{stockStatus}</p>
            <p className="text-4xl font-extrabold text-indigo-600 mb-6">
              ${product.price ? product.price.toFixed(2) : 'N/A'}
            </p>
          </div>
          
          {/* Quantity Selector and Add to Cart Button */}
          {product.countInStock > 0 && (
            <div className="flex items-center gap-4 mb-6">
              <label htmlFor="quantity" className="font-medium text-gray-700">Quantity:</label>
              <input 
                type="number" 
                id="quantity" 
                name="quantity"
                value={selectedQuantity}
                onChange={handleQuantityChange}
                min="1"
                max={product.countInStock}
                className="w-20 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          )}

          {addToCartSuccess && (
            <div className="mb-4 p-3 text-sm text-green-700 bg-green-100 border border-green-400 rounded-md">
              Product added to cart successfully!
            </div>
          )}

          <div className="mt-auto">
            <button 
              type="button"
              onClick={handleAddToCart}
              className={`w-full py-3 px-6 text-lg font-semibold rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
                ${product.countInStock > 0 
                  ? 'bg-green-500 hover:bg-green-600 text-white focus:ring-green-500' 
                  : 'bg-gray-400 text-gray-700 cursor-not-allowed focus:ring-gray-400'}`}
              disabled={product.countInStock === 0 || isNaN(selectedQuantity) || selectedQuantity <=0 }
            >
              {product.countInStock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Section Placeholder */}
      <div className="mt-12 bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Reviews</h2>
        <p className="text-gray-600">Reviews will be shown here once the feature is implemented.</p>
        {/* Future: Component for listing reviews and adding a review */}
      </div>
    </div>
  );
};

export default ProductDetailPage;
