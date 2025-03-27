const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

// Load env vars
dotenv.config();

const updateUserRole = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: 'vantage',
      maxPoolSize: 10,
      minPoolSize: 2,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 10000,
      heartbeatFrequencyMS: 30000,
      retryWrites: true,
      retryReads: true,
      w: 'majority',
      family: 4,
      serverApi: {
        version: '1',
        strict: true,
        deprecationErrors: true,
      }
    });

    console.log('Connected to MongoDB');

    // Update the user's role
    const result = await User.findOneAndUpdate(
      { email: 'vantagebusinessinc@gmail.com' },
      { role: 'admin' },
      { new: true }
    );
    
    if (result) {
      console.log('User role updated successfully:', result);
    } else {
      console.log('User not found');
    }

    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

updateUserRole(); 