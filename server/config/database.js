const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`🍃 MongoDB Connected: ${conn.connection.host}`);

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🍃 MongoDB connection closed through app termination');
      process.exit(0);
    });

    return conn;

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('⚠️  Server will continue without database connection');
    console.log('💡 To fix this:');
    console.log('   1. Make sure MongoDB is running locally on port 27017');
    console.log('   2. Or set up MongoDB Atlas and update MONGODB_URI in .env file');
    console.log('   3. Run the setup script: npm run setup:mongodb');
    // Don't exit, let server continue
    return null;
  }
};

// Helper function to check if database is connected
const isDatabaseConnected = () => {
  return mongoose.connection.readyState === 1;
};

module.exports = {
  connectDB,
  isDatabaseConnected
};
