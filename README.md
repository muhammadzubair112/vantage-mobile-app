# Vantage App

A React Native application for appointment scheduling and team management.

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your mobile device (for testing)

## Project Structure

```
vantage-app/
├── app/                # React Native screens and navigation
├── assets/            # Images, fonts, and other static files
├── backend/           # Express.js server
├── components/        # Reusable React components
├── constants/         # Configuration and constants
├── hooks/            # Custom React hooks
├── types/            # TypeScript type definitions
└── mocks/            # Test mocks
```

## Quick Start Guide

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd vantage-app

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
```

### 2. Configure Environment Variables

```bash
# In the backend directory
cp .env.example .env
```

Update the `.env` file with your configuration:
```
MONGODB_URI=mongodb://localhost:27017/vantage
JWT_SECRET=your_jwt_secret
PORT=5001
NODE_ENV=development
```

### 3. Start MongoDB

Make sure MongoDB is running on your system:
```bash
# macOS (with Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

### 4. Start the Backend Server

```bash
# In the backend directory
npm run dev
```

The server will start on http://localhost:5001

### 5. Start the Frontend Development Server

```bash
# In the root directory
npm start
```

This will start the Expo development server and display a QR code.

### 6. Run the Application

- Install Expo Go on your mobile device
- Scan the QR code with:
  - iOS: Camera app
  - Android: Expo Go app
- Or press 'i' for iOS simulator or 'a' for Android emulator

## Testing

### Backend Testing

```bash
# In the backend directory
node test-server.js    # Test server setup
node testConnection.js # Test database connection
node test-auth.js     # Test authentication endpoints
```

### Frontend Testing

```bash
# In the root directory
npm test
```

## Common Issues and Solutions

1. **MongoDB Connection Error**
   ```
   Error: MongoDB connection failed
   ```
   - Check if MongoDB is running
   - Verify MongoDB URI in `.env`
   - Ensure MongoDB port (default: 27017) is not blocked

2. **API Connection Error**
   ```
   Error: Network request failed
   ```
   - Verify backend server is running
   - Check API URL in `constants/Config.ts`
   - Ensure device/emulator can access the server IP

3. **Permission Issues**
   ```
   Error: You don't have permission to perform this action
   ```
   - Default user role is 'client'
   - Use seeder to create admin user:
   ```bash
   cd backend
   node seeder.js
   ```

## Development Tools

- React Native Debugger
- MongoDB Compass (for database management)
- Postman (for API testing)

## Available Scripts

Backend:
- `npm start`: Start production server
- `npm run dev`: Start development server with nodemon

Frontend:
- `npm start`: Start Expo development server with tunnel
- `npm run start-web`: Start web version
- `npm run start-web-dev`: Start web version with debug output

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## Support

For issues and questions:
1. Check the Common Issues section
2. Review existing GitHub issues
3. Create a new issue with:
   - Environment details
   - Steps to reproduce
   - Expected vs actual behavior

## License

[Your License Type] - See LICENSE file for details