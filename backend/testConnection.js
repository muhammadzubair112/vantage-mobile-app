require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
  console.log('Testing MongoDB connection...');
  
  try {
    const options = {
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
      family: 4
    };

    console.log('Attempting to connect to MongoDB...');
    console.log('Connection URI:', process.env.MONGO_URI.replace(/mongodb\+srv:\/\/([^:]+):([^@]+)@/, 'mongodb+srv://[username]:[password]@'));
    
    const conn = await mongoose.connect(process.env.MONGO_URI, options);
    
    console.log('MongoDB connection successful!');
    console.log(`Connected to: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
    
    // Test the connection by running a simple command
    const result = await conn.connection.db.admin().ping();
    console.log('Ping result:', result);
    
    // Close the connection
    await mongoose.connection.close();
    console.log('Connection closed successfully');
    
  } catch (error) {
    console.error('MongoDB connection test failed:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Full error:', error);
    
    if (error.name === 'MongoParseError') {
      console.error('Invalid MongoDB connection string format');
    } else if (error.name === 'MongoNetworkError') {
      console.error('Network error while attempting to connect to MongoDB');
    } else if (error.name === 'MongoServerSelectionError') {
      console.error('Unable to select a MongoDB server for the operation');
    }
  } finally {
    // Ensure we exit the process
    process.exit(0);
  }
}

testConnection(); 