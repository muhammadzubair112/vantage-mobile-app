const mongoose = require('mongoose');
const { ServerApiVersion } = require('mongodb');

const connectDB = async () => {
  console.log('Initializing database connection...');

  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI environment variable is not defined');
    throw new Error('MONGO_URI environment variable is not defined');
  }

  try {
    console.log('Attempting to connect to MongoDB...');
    console.log('Connection URI:', process.env.MONGO_URI.replace(/mongodb\+srv:\/\/([^:]+):([^@]+)@/, 'mongodb+srv://[username]:[password]@'));

    // Updated MongoDB connection options
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
      family: 4, // Force IPv4
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
    };

    console.log('Using connection options:', {
      ...options,
      // Don't log sensitive data
      uri: process.env.MONGO_URI.split('@')[1]
    });

    const conn = await mongoose.connect(process.env.MONGO_URI, options);

    // Send a ping to confirm a successful connection
    await conn.connection.db.command({ ping: 1 });
    console.log("Pinged deployment. Successfully connected to MongoDB!");
    
    // Get database stats
    const stats = await conn.connection.db.stats();
    console.log('Database Stats:', {
      dbSize: Math.round(stats.dataSize / (1024 * 1024) * 100) / 100 + ' MB',
      storageSize: Math.round(stats.storageSize / (1024 * 1024) * 100) / 100 + ' MB',
      collections: stats.collections,
      objects: stats.objects
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log('Database:', conn.connection.name);
    console.log('Connection state:', conn.connection.readyState);

    // Set up connection event listeners
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      console.error('Stack trace:', err.stack);
      // Don't exit on connection errors, let Mongoose handle reconnection
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
      console.log('Mongoose will attempt to reconnect automatically');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

    mongoose.connection.on('reconnectFailed', () => {
      console.error('MongoDB reconnection failed after maximum attempts');
    });

    // Graceful shutdown handler
    process.on('SIGINT', async () => {
      try {
        console.log('Received SIGINT. Closing MongoDB connection...');
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination');
      } catch (err) {
        console.error('Error during MongoDB connection closure:', err);
      }
    });

    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.error('Stack trace:', error.stack);
    
    // Log specific error information
    if (error.name === 'MongoParseError') {
      console.error('Invalid MongoDB connection string format');
    } else if (error.name === 'MongoNetworkError') {
      console.error('Network error while attempting to connect to MongoDB');
    } else if (error.name === 'MongoServerSelectionError') {
      console.error('Unable to select a MongoDB server for the operation');
    }
    
    throw error; // Let the caller handle the error
  }
};

module.exports = connectDB;