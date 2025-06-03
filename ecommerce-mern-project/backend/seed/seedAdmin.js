const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/UserModel');

// Load environment variables from ../.env
dotenv.config({ path: require('path').resolve(__dirname, '../.env') });

// Admin User Credentials (use environment variables or defaults)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'adminpassword';
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('Error: MONGO_URI is not defined in your .env file.');
  process.exit(1);
}

const seedAdminUser = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      // Options are deprecated: useNewUrlParser: true, useUnifiedTopology: true
    });
    console.log('MongoDB connected for seeding...');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });

    if (existingAdmin) {
      console.log(`Admin user with email ${ADMIN_EMAIL} already exists.`);
      await mongoose.disconnect();
      console.log('MongoDB disconnected.');
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

    // Create new admin user
    const adminUser = new User({
      name: 'Admin User',
      email: ADMIN_EMAIL,
      password: hashedPassword,
      isAdmin: true,
    });

    // Save admin user to database
    await adminUser.save();
    console.log(`Admin user ${ADMIN_EMAIL} created successfully!`);

  } catch (error) {
    console.error('Error seeding admin user:', error);
  } finally {
    // Disconnect Mongoose
    // Check if mongoose connection is still open before trying to disconnect
    if (mongoose.connection.readyState === 1) { // 1 means connected
        await mongoose.disconnect();
        console.log('MongoDB disconnected.');
    }
  }
};

// Run the seeder function
seedAdminUser();
