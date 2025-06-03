const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const User = require('../models/UserModel');

dotenv.config({ path: require('path').resolve(__dirname, '../.env') }); // Ensure .env from backend root is loaded

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token payload
      // Exclude password from the user object
      req.user = await User.findById(decoded.userId).select('-password');

      if (!req.user) {
        // This case might happen if a user was deleted after a token was issued.
        return res.status(401).json({ message: 'Not authorized, user not found.' });
      }

      next();
    } catch (error) {
      console.error('Token verification error:', error);
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ message: 'Not authorized, token failed.' });
      }
      return res.status(401).json({ message: 'Not authorized, token failed.' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token.' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as an admin.' });
  }
};

module.exports = { protect, admin };
