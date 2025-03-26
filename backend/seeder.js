const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load env vars
dotenv.config();

// Load models
const User = require('./models/User');
const Team = require('./models/Team');
const Service = require('./models/Service');
const Appointment = require('./models/Appointment');
const Conversation = require('./models/Conversation');
const Message = require('./models/Message');

// Connect to DB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Sample data
const services = [
  {
    name: 'Website Development',
    description: 'Custom website design and development for your business',
    duration: 30,
    icon: 'globe'
  },
  {
    name: 'Digital Marketing',
    description: 'Strategic digital marketing to grow your online presence',
    duration: 30,
    icon: 'trending-up'
  },
  {
    name: 'SEO Consultation',
    description: 'Improve your search engine rankings and visibility',
    duration: 45,
    icon: 'search'
  },
  {
    name: 'Social Media Advertising',
    description: 'Targeted social media campaigns to reach your audience',
    duration: 30,
    icon: 'share-2'
  }
];

// Import data into DB
const importData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Team.deleteMany();
    await Service.deleteMany();
    await Appointment.deleteMany();
    await Conversation.deleteMany();
    await Message.deleteMany();

    console.log('Data cleared...');

    // Create admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const admin = await User.create({
      name: 'John Admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
      phone: '+1234567890',
      companyName: 'Vantage Media'
    });

    // Create client user
    const client = await User.create({
      name: 'Sarah Client',
      email: 'client@example.com',
      password: hashedPassword,
      role: 'client',
      phone: '+1987654321',
      companyName: 'Client Company'
    });

    console.log('Users created...');

    // Create team
    const team = await Team.create({
      name: 'Vantage Media Team',
      ownerId: admin._id,
      members: [admin._id]
    });

    // Update admin with team ID
    await User.findByIdAndUpdate(admin._id, { teamId: team._id });

    console.log('Team created...');

    // Create services
    const createdServices = await Service.create(services);

    console.log('Services created...');

    // Create conversation
    const conversation = await Conversation.create({
      clientId: client._id,
      clientName: client.name,
      clientCompany: client.companyName,
      lastMessage: 'When will my website be ready?',
      lastMessageTimestamp: Date.now() - 3600000 // 1 hour ago
    });

    // Create messages
    await Message.create([
      {
        conversationId: conversation._id,
        senderId: client._id,
        text: 'Hello, I wanted to check on the progress of my website project.',
        timestamp: Date.now() - 7200000, // 2 hours ago
        read: true,
        isClient: true
      },
      {
        conversationId: conversation._id,
        senderId: admin._id,
        text: 'Hi Sarah, we are currently working on the design phase. Should be ready for review by next week.',
        timestamp: Date.now() - 5400000, // 1.5 hours ago
        read: true,
        isClient: false
      },
      {
        conversationId: conversation._id,
        senderId: client._id,
        text: 'When will my website be ready?',
        timestamp: Date.now() - 3600000, // 1 hour ago
        read: false,
        isClient: true
      }
    ]);

    console.log('Conversation and messages created...');

    // Create team chat
    const teamChat = await Conversation.create({
      clientId: admin._id,
      clientName: 'Vantage Media Team Chat',
      clientCompany: 'Team Chat',
      lastMessage: 'Welcome to the team chat!',
      lastMessageTimestamp: Date.now() - 1000000, // Recent
      isTeamChat: true,
      teamId: team._id
    });

    // Create team chat message
    await Message.create({
      conversationId: teamChat._id,
      senderId: admin._id,
      senderName: 'John Admin',
      text: 'Welcome to the team chat! This is where we can discuss client projects.',
      timestamp: Date.now() - 1000000,
      read: true,
      isClient: false,
      isTeamChat: true
    });

    console.log('Team chat created...');

    console.log('Data imported successfully!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// Run the import
importData();