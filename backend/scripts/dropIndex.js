const mongoose = require('mongoose');
require('dotenv').config();

async function dropIndex() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Get the collection
    const collection = mongoose.connection.collection('availabilities');

    // Drop the old index
    await collection.dropIndex('user_1_dayOfWeek_1');
    console.log('Successfully dropped the old index');

    // Verify indexes
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes);

    await mongoose.connection.close();
    console.log('Connection closed');
  } catch (error) {
    console.error('Error:', error);
  }
}

dropIndex(); 