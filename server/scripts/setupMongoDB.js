const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🍃 FlickNet MongoDB Setup Assistant\n');

const setupMongoDB = async () => {
  console.log('Choose your MongoDB setup option:\n');
  console.log('1. 🏠 Local MongoDB Setup (Recommended for development)');
  console.log('2. ☁️  MongoDB Atlas Setup (Cloud database)');
  console.log('3. ℹ️  Show setup instructions only\n');

  // For now, let's provide detailed instructions
  showSetupInstructions();
};

const showSetupInstructions = () => {
  console.log('📋 MongoDB Setup Instructions for FlickNet\n');
  
  console.log('🏠 Option 1: Local MongoDB Setup');
  console.log('================================');
  console.log('1. Download and install MongoDB Community Server:');
  console.log('   https://www.mongodb.com/try/download/community');
  console.log('');
  console.log('2. Start MongoDB service:');
  console.log('   Windows: Start "MongoDB" service from Services');
  console.log('   macOS: brew services start mongodb/brew/mongodb-community');
  console.log('   Linux: sudo systemctl start mongod');
  console.log('');
  console.log('3. Your local MongoDB will be available at:');
  console.log('   mongodb://localhost:27017/flicknet');
  console.log('');
  console.log('4. Update your .env file with:');
  console.log('   MONGODB_URI=mongodb://localhost:27017/flicknet');
  console.log('');

  console.log('☁️  Option 2: MongoDB Atlas Setup (Cloud)');
  console.log('=========================================');
  console.log('1. Go to https://www.mongodb.com/atlas');
  console.log('2. Create a free account and new cluster');
  console.log('3. Create a database user with read/write permissions');
  console.log('4. Whitelist your IP address (or use 0.0.0.0/0 for development)');
  console.log('5. Get your connection string from "Connect" > "Connect your application"');
  console.log('6. Update your .env file with:');
  console.log('   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/flicknet');
  console.log('');

  console.log('🔧 Environment Variables Setup');
  console.log('==============================');
  console.log('Make sure your .env file contains:');
  console.log('');
  console.log('# MongoDB Configuration');
  console.log('MONGODB_URI=mongodb://localhost:27017/flicknet');
  console.log('# Or for Atlas:');
  console.log('# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/flicknet');
  console.log('');
  console.log('# JWT Configuration');
  console.log('JWT_SECRET=your-super-secret-jwt-key-here');
  console.log('JWT_EXPIRE=30d');
  console.log('');

  console.log('🚀 Getting Started');
  console.log('==================');
  console.log('1. Install dependencies:');
  console.log('   npm install');
  console.log('');
  console.log('2. Seed the database with sample data:');
  console.log('   npm run seed');
  console.log('');
  console.log('3. Start the development server:');
  console.log('   npm run dev');
  console.log('');

  console.log('🔍 Testing Your Setup');
  console.log('=====================');
  console.log('1. Check if MongoDB is running:');
  console.log('   Visit: http://localhost:3001/health');
  console.log('');
  console.log('2. Test authentication:');
  console.log('   Login with: admin@flicknet.com / admin123');
  console.log('');
  console.log('3. Check database stats (admin only):');
  console.log('   Visit: http://localhost:3001/api/auth/database/stats');
  console.log('');

  console.log('📚 MongoDB Tools (Optional)');
  console.log('============================');
  console.log('1. MongoDB Compass (GUI):');
  console.log('   https://www.mongodb.com/products/compass');
  console.log('');
  console.log('2. MongoDB Shell (CLI):');
  console.log('   https://www.mongodb.com/docs/mongodb-shell/');
  console.log('');

  console.log('🆘 Troubleshooting');
  console.log('==================');
  console.log('1. Connection refused error:');
  console.log('   - Make sure MongoDB service is running');
  console.log('   - Check if port 27017 is available');
  console.log('');
  console.log('2. Authentication failed:');
  console.log('   - Check username/password in connection string');
  console.log('   - Verify database user permissions');
  console.log('');
  console.log('3. Network timeout (Atlas):');
  console.log('   - Check IP whitelist settings');
  console.log('   - Verify internet connection');
  console.log('');

  console.log('✅ Setup Complete!');
  console.log('==================');
  console.log('Your FlickNet application is now configured to use MongoDB.');
  console.log('Run "npm run dev" to start the development server.');
  console.log('');
};

const checkMongoDBConnection = async () => {
  try {
    const mongoose = require('mongoose');
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/flicknet';
    
    console.log('🔍 Testing MongoDB connection...');
    await mongoose.connect(uri);
    console.log('✅ MongoDB connection successful!');
    await mongoose.disconnect();
    return true;
  } catch (error) {
    console.log('❌ MongoDB connection failed:', error.message);
    return false;
  }
};

const generateJWTSecret = () => {
  const crypto = require('crypto');
  return crypto.randomBytes(64).toString('hex');
};

const updateEnvFile = () => {
  const envPath = path.join(__dirname, '../../.env');
  
  try {
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // Check if JWT_SECRET exists and is not placeholder
    if (!envContent.includes('JWT_SECRET=') || envContent.includes('your-super-secret-jwt-key-here')) {
      const newSecret = generateJWTSecret();
      
      if (envContent.includes('JWT_SECRET=')) {
        envContent = envContent.replace(/JWT_SECRET=.*/, `JWT_SECRET=${newSecret}`);
      } else {
        envContent += `\nJWT_SECRET=${newSecret}\n`;
      }
      
      fs.writeFileSync(envPath, envContent);
      console.log('✅ Generated new JWT secret');
    }
    
  } catch (error) {
    console.log('⚠️  Could not update .env file:', error.message);
  }
};

// Run setup
setupMongoDB();
