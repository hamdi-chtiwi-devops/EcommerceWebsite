const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config();

// Connect to MongoDB
const MONGO_URI = "postgresql://postgres:&qbcby777@@db.eyidcmslyiwybimmwhkr.supabase.co:5432/postgres";

mongoose.connect(MONGO_URI, { /*useNewUrlParser: true, useUnifiedTopology: true*/ }) // useNewUrlParser and useUnifiedTopology are deprecated
  .then(() => console.log('MongoDB connected successfully.'))
  .catch(err => console.error('MongoDB connection error:', err));

// Initialize Express app
const app = express();

// Middlewares
app.use(cors());
app.use(helmet());
app.use(express.json()); // Middleware to parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Middleware for URL-encoded bodies

// --- Import Routes ---
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes'); // Added

// --- Mount Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes); // Added

// Simple GET route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Define PORT
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
