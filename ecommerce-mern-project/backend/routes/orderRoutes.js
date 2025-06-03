const express = require('express');
const Order = require('../models/OrderModel');
const { protect } = require('../middleware/authMiddleware'); // Only 'protect' is needed for users creating their own orders

const router = express.Router();

// --- POST /api/orders (Create Order - User Protected) ---
router.post('/', protect, async (req, res) => {
  const { 
    orderItems, 
    shippingAddress, 
    paymentMethod, 
    itemsPrice, 
    taxPrice, 
    shippingPrice, 
    totalPrice 
  } = req.body;

  try {
    // Validation
    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items provided.' });
    }

    // Ensure orderItems have the required fields and product is just the ID
    // This mapping can also be done on the frontend before sending
    const processedOrderItems = orderItems.map(item => ({
      name: item.name,
      qty: item.qty,
      image: item.image, // Assuming image is a URL/path string
      price: item.price,
      product: item.product || item._id, // Ensure product is just the ObjectId
    }));

    const order = new Order({
      user: req.user._id, // From 'protect' middleware
      orderItems: processedOrderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      // isPaid, paidAt, isDelivered, deliveredAt will have defaults or be set later
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);

  } catch (error) {
    console.error('Error creating order:', error);
    if (error.name === 'ValidationError') {
      // Collect specific validation error messages
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: 'Validation Error', errors: messages });
    }
    res.status(500).json({ message: 'Server error while creating order.' });
  }
});

// --- GET /api/orders/myorders (Get Logged-in User's Orders - User Protected) ---
router.get('/myorders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }); // Sort by newest first
    res.json(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ message: 'Server error while fetching orders.' });
  }
});

// --- GET /api/orders/:id (Get Order by ID - User Protected, Admin access) ---
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    // Check if the logged-in user is the owner of the order or an admin
    if (order.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(401).json({ message: 'Not authorized to view this order.' });
    }

    res.json(order);

  } catch (error) {
    console.error('Error fetching order by ID:', error);
    if (error.kind === 'ObjectId') { // Mongoose throws this for invalid ID format
      return res.status(404).json({ message: 'Order not found (invalid ID format).' });
    }
    res.status(500).json({ message: 'Server error while fetching order details.' });
  }
});

// --- PUT /api/orders/:id/pay (Update Order to Paid - User Protected) ---
router.put('/:id/pay', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    // Optional: Further authorization if needed (e.g. only order owner can pay)
    // For now, `protect` ensures a logged-in user. If order.user.toString() !== req.user._id.toString() ...
    // But typically payment might be less restrictive or handled by admin too.

    if (order.isPaid) {
      return res.status(400).json({ message: 'Order is already paid.' });
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    
    // Expecting paymentResult details from req.body (e.g., from PayPal SDK or a mock)
    // Ensure req.body is not empty and contains expected fields for paymentResult
    if (req.body && Object.keys(req.body).length > 0) {
        order.paymentResult = {
          id: req.body.id,
          status: req.body.status,
          update_time: req.body.update_time,
          email_address: req.body.email_address,
        };
    } else {
        // If no body is sent, create a mock/placeholder paymentResult
        // This is for the "Placeholder" nature of this endpoint for now
        order.paymentResult = {
            id: `mock_payment_${Date.now()}`,
            status: 'COMPLETED',
            update_time: new Date().toISOString(),
            email_address: req.user.email || 'mockpayer@example.com'
        };
    }


    const updatedOrder = await order.save();
    res.json(updatedOrder);

  } catch (error) {
    console.error('Error updating order to paid:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Order not found (invalid ID format).' });
    }
    res.status(500).json({ message: 'Server error while updating order.' });
  }
});

module.exports = router;
