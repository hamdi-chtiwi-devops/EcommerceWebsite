const express = require('express');
const Product = require('../models/ProductModel');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// --- POST /api/products (Create Product - Admin Only) ---
router.post('/', protect, admin, async (req, res) => {
  const { name, price, category, countInStock, description, brand } = req.body;

  // Basic validation
  if (!name || !price || !category || !countInStock || !description) {
    return res.status(400).json({ message: 'Please provide name, price, category, countInStock, and description.' });
  }

  try {
    const product = new Product({
      user: req.user._id, // From 'protect' middleware
      name,
      price: Number(price),
      category, // Assuming category is a string ID or name for now. If it's an ObjectId, ensure it's valid.
      countInStock: Number(countInStock),
      description,
      brand: brand || '', // Optional
      image: '/images/sample.jpg', // Placeholder image, will be handled later
      rating: 0, // Default value
      numReviews: 0, // Default value
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation Error', errors: error.errors });
    }
    res.status(500).json({ message: 'Server error while creating product.' });
  }
});

// --- GET /api/products (Get All Products - Public) ---
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({}).populate('category', 'name').populate('user', 'name'); // Populate category and user name
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error while fetching products.' });
  }
});

// --- GET /api/products/:id (Get Single Product - Public) ---
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name').populate('user', 'name');
    if (product) {
      res.status(200).json(product);
    } else {
      res.status(404).json({ message: 'Product not found.' });
    }
  } catch (error) {
    console.error('Error fetching single product:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Product not found (invalid ID format).' });
    }
    res.status(500).json({ message: 'Server error while fetching product.' });
  }
});

// --- PUT /api/products/:id (Update Product - Admin Only) ---
router.put('/:id', protect, admin, async (req, res) => {
  const { name, price, category, countInStock, description, brand, image } = req.body;

  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    // Update fields if provided
    product.name = name || product.name;
    product.price = price !== undefined ? Number(price) : product.price;
    product.description = description || product.description;
    product.image = image || product.image; // Image update will be more complex later
    product.brand = brand || product.brand;
    product.category = category || product.category;
    product.countInStock = countInStock !== undefined ? Number(countInStock) : product.countInStock;

    const updatedProduct = await product.save();
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation Error', errors: error.errors });
    }
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Product not found (invalid ID format).' });
    }
    res.status(500).json({ message: 'Server error while updating product.' });
  }
});

// --- DELETE /api/products/:id (Delete Product - Admin Only) ---
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    await product.deleteOne(); // Mongoose v6+
    res.status(200).json({ message: 'Product removed successfully.' });
  } catch (error) {
    console.error('Error deleting product:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Product not found (invalid ID format).' });
    }
    res.status(500).json({ message: 'Server error while deleting product.' });
  }
});

module.exports = router;
