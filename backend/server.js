// Enable debug logging
const DEBUG = true;

function debug(message, ...args) {
  if (DEBUG) {
    console.log(`[DEBUG] ${message}`, ...args);
  }
}

// Immediate error handling with debug info
process.on('uncaughtException', (error) => {
  debug('UNCAUGHT EXCEPTION! 💥');
  debug('Error name:', error.name);
  debug('Error message:', error.message);
  debug('Stack:', error.stack);
  console.error('UNCAUGHT EXCEPTION! 💥');
  console.error(error.name, error.message);
});

process.on('unhandledRejection', (reason, promise) => {
  debug('UNHANDLED REJECTION! 💥');
  debug('Reason:', reason);
  debug('Promise:', promise);
  console.error('UNHANDLED REJECTION! 💥');
  console.error('Reason:', reason);
});

// Prevent immediate termination
process.on('SIGTERM', () => {
  console.log('Received SIGTERM - ignoring to keep server running');
});

process.on('SIGINT', () => {
  console.log('Received SIGINT - ignoring to keep server running');
});

// Enable debug logging
process.env.DEBUG = '*';

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

console.log('Starting server initialization...');

// Load env vars first thing
dotenv.config();
console.log('Environment variables loaded:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI ? '(set)' : '(not set)',
  JWT_SECRET: process.env.JWT_SECRET ? '(set)' : '(not set)',
  JWT_EXPIRE: process.env.JWT_EXPIRE
});

// Create Express app
const app = express();

// Security middleware
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'exp://localhost:19000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  exposedHeaders: ['set-cookie']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  console.log('Development logging enabled');
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    pid: process.pid
  });
});

console.log('Loading route files...');
// Route files
const auth = require('./routes/auth');
const users = require('./routes/users');
const teams = require('./routes/teams');
const services = require('./routes/services');
const appointments = require('./routes/appointments');
const messages = require('./routes/messages');
console.log('Route files loaded');

console.log('Mounting routes...');
// Mount routers
app.use('/api/auth', auth);
app.use('/api/users', users);
app.use('/api/teams', teams);
app.use('/api/services', services);
app.use('/api/appointments', appointments);
app.use('/api/messages', messages);
console.log('Routes mounted');

// Error handler middleware
app.use(errorHandler);
console.log('Error handler middleware configured');

const PORT = process.env.PORT || 5001;
const HOST = process.env.HOST || 'localhost';

async function startServer() {
  let retryCount = 0;
  const maxRetries = 3;
  const retryDelay = 5000; // 5 seconds

  debug('Starting server initialization');
  debug('Environment:', {
    NODE_ENV: process.env.NODE_ENV,
    PORT,
    HOST,
    MONGO_URI: process.env.MONGO_URI ? '(set)' : '(not set)',
    JWT_SECRET: process.env.JWT_SECRET ? '(set)' : '(not set)',
  });

  while (retryCount < maxRetries) {
    try {
      debug(`Attempt ${retryCount + 1}/${maxRetries} to start server`);
      
      // Connect to MongoDB
      debug('Attempting MongoDB connection...');
      await connectDB();
      debug('MongoDB connection successful');

      // Start server
      debug('Creating HTTP server...');
      const server = app.listen(PORT, HOST, () => {
        debug('Server listen callback executed');
        console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
        console.log(`Server accessible at http://${HOST}:${PORT}`);
      });

      // Handle server errors
      server.on('error', (error) => {
        debug('Server error event:', error);
        console.error('Server error:', error);
        if (error.code === 'EADDRINUSE') {
          console.error(`Port ${PORT} is already in use`);
        }
      });

      // Graceful shutdown
      process.on('SIGTERM', async () => {
        debug('SIGTERM received');
        console.log('SIGTERM received. Starting graceful shutdown...');
        try {
          debug('Closing MongoDB connection...');
          await mongoose.connection.close();
          debug('MongoDB connection closed');
          
          debug('Closing HTTP server...');
          server.close(() => {
            debug('HTTP server closed');
            console.log('Server closed');
            process.exit(0);
          });
        } catch (err) {
          debug('Error during shutdown:', err);
          console.error('Error during shutdown:', err);
          process.exit(1);
        }
      });

      // Successfully started
      debug('Server startup completed successfully');
      return;

    } catch (error) {
      debug(`Attempt ${retryCount + 1}/${maxRetries} failed:`, error);
      console.error(`Attempt ${retryCount + 1}/${maxRetries} failed:`, error.message);
      
      if (retryCount < maxRetries - 1) {
        debug(`Scheduling retry in ${retryDelay/1000} seconds...`);
        console.log(`Retrying in ${retryDelay/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        retryCount++;
      } else {
        debug('Maximum retry attempts reached');
        console.error('Maximum retry attempts reached. Server startup failed.');
        console.error('Please check your MongoDB connection and try again.');
        // Don't exit, just log the error
        break;
      }
    }
  }
}

// Start the server
debug('Initiating server startup sequence...');
console.log('Initiating server startup...');
startServer().catch(error => {
  debug('Unhandled error in startServer:', error);
  console.error('Unhandled error in startServer:', error);
});