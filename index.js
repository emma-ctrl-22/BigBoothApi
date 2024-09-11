const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb+srv://emmanuelnyatepe35:eddieproject@bigbooth.muzkv.mongodb.net/?retryWrites=true&w=majority&appName=bigbooth')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log('MongoDB connection error:', err));

// Use routes
app.use('/api/users', userRoutes);
app.use('/api', orderRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
