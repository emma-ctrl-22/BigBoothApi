const express = require('express');
const router = express.Router();
const Order = require('../models/Orders');
const User = require('../models/User');

// Create an order and assign a random driver
router.post('/orders', async (req, res) => {
    const { userId, pickupLocation, dropoffLocation, price, distance } = req.body;
    console.log(req.body);
    try {
        // Find a random driver
        const driver = await User.aggregate([{ $match: { isDriver: true } }, { $sample: { size: 1 } }]);
        if (!driver.length) return res.status(500).json({ message: 'No available drivers' });

        // Create a new order
        const order = new Order({
            user: userId,
            driver: driver[0]._id,
            pickupLocation,
            dropoffLocation,
            price,
            distance,
        });

        await order.save();

        // Fetch driver's name and email from User collection
        const driverDetails = await User.findById(driver[0]._id).select('name email');

        res.status(201).json({
            message: 'Order created',
            order: {
                _id: order._id,
                pickupLocation: order.pickupLocation,
                dropoffLocation: order.dropoffLocation,
                price: order.price,
                distance: order.distance,
                driver: driverDetails, // Include driver's details here
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// Get pending orders assigned to the driver
router.get('/driver/:driverId', async (req, res) => {
    try {
        const orders = await Order.find({ driver: req.params.driverId, status: 'pending' }).populate('user', 'name');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update order status (driver accepts or declines the ride)
router.put('/edit-orders/:orderId', async (req, res) => {
    const { status } = req.body;
    console.log(req.body);
    if (!['accepted', 'declined'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    try {
        const order = await Order.findByIdAndUpdate(req.params.orderId, { status }, { new: true });
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json({ message: `Order ${status}`, order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// routes/order.js
router.get('/user/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        console.log(userId);

        const orders = await Order.find({ user: userId })
            .sort({ createdAt: -1 }) // Sort by latest first
            .populate('driver', 'name email') // Populate driver's name and email
            .select('pickupLocation dropoffLocation price distance createdAt driver status arrived'); // Include driver in selection
console.log(orders, 'orders');
        const formattedOrders = orders.map(order => ({
            _id: order._id,
            pickupLocation: order.pickupLocation,
            dropoffLocation: order.dropoffLocation,
            price: order.price,
            distance: order.distance,
            createdAt: order.createdAt,
            driverName: order.driver ? order.driver.name : 'Not assigned',
            driverEmail: order.driver ? order.driver.email : 'Not assigned',
            status: order.status,
            arrived: order.arrived === true ? 'true': 'false'
        }));
console.log(formattedOrders);
        res.json(formattedOrders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/driver-history/:driverId', async (req, res) => {
    try {
        const orders = await Order.find({ driver: req.params.driverId, })
            .populate('user', 'name email');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put('/orders-arrival/:orderId', async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(req.params.orderId, { arrived: true });
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json({ message: 'Arrival marked', order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
