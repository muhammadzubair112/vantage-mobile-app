# Vantage Media App

A full-stack mobile application for managing appointments, team communication, and client services.

## Backend Setup

1. Navigate to the backend directory:
```
cd backend
```

2. Install dependencies:
```
npm install
```

3. Set up environment variables:
- Create a `.env` file based on the provided example
- Configure your MongoDB connection string

4. Seed the database with initial data:
```
node seeder.js
```

5. Start the server:
```
npm run dev
```

## Frontend Setup

1. Install dependencies:
```
bun install
```

2. Update the API URL:
- Open `hooks/useApi.ts`
- Update the `API_URL` constant to match your backend server address

3. Start the app:
```
bun start
```

## Demo Credentials

- Admin: admin@example.com / password123
- Client: client@example.com / password123

## Features

- User authentication (login/register)
- Team management
- Appointment scheduling
- Messaging system
- Service management
- Profile management

## Tech Stack

- Frontend: React Native with Expo
- Backend: Node.js, Express
- Database: MongoDB
- State Management: Zustand
- Authentication: JWT