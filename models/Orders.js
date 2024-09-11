const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    pickupLocation: { type: locationSchema, required: true },
    dropoffLocation: { type: locationSchema, required: true },
    status: { type: String, enum: ['pending', 'accepted', 'declined', 'completed'], default: 'pending' },
    price: { type: Number, required: true },
    distance: { type: Number, required: true },
    arrived: { type: Boolean, default: false } // New field
});

const Order = mongoose.model('OrderNew', orderSchema);

module.exports = Order;
