const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Order = require('../models/Orders');

// User registration
router.post('/register', async (req, res) => {
  const { name, email, password, isDriver } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const user = new User({ name, email, password, isDriver });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// User login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      const token = jwt.sign({ userId: user._id }, 'your_jwt_secret', { expiresIn: '1h' });
      res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isDriver: user.isDriver,
        },
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  

// Get user ride history
router.get('/:userId/orders', async (req, res) => {
  try {
    const orders = await Order.find({ user: req.params.userId }).populate('driver', 'name');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
