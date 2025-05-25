const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 FlickNet MongoDB Setup Assistant\n');

const setupMongoDB = async () => {
  console.log('Choose your MongoDB setup option:\n');
  console.log('1. 🌐 MongoDB Atlas (Cloud) - Recommended for beginners');
  console.log('2. 💻 Local MongoDB Installation');
  console.log('3. 🐳 Docker MongoDB (if you have Docker)');
  console.log('4. ℹ️  Show setup instructions only\n');

  // For now, let's provide detailed instructions
  showSetupInstructions();
};

const showSetupInstructions = () => {
  console.log('📋 MongoDB Setup Instructions:\n');

  console.log('🌐 OPTION 1: MongoDB Atlas (Cloud) - EASIEST');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('1. Go to https://www.mongodb.com/atlas');
  console.log('2. Click "Try Free" and create an account');
  console.log('3. Create a new cluster (choose the free tier)');
  console.log('4. Create a database user with username/password');
  console.log('5. Add your IP address to the whitelist (or use 0.0.0.0/0 for development)');
  console.log('6. Get your connection string (looks like: mongodb+srv://username:password@cluster.mongodb.net/flicknet)');
  console.log('7. Update your .env file with: MONGODB_URI=your-connection-string');
  console.log('');

  console.log('💻 OPTION 2: Local MongoDB Installation');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Windows:');
  console.log('1. Download MongoDB Community Server from https://www.mongodb.com/try/download/community');
  console.log('2. Run the installer and follow the setup wizard');
  console.log('3. Start MongoDB service: net start MongoDB');
  console.log('4. MongoDB will be available at: mongodb://localhost:27017');
  console.log('');
  console.log('macOS (with Homebrew):');
  console.log('1. brew tap mongodb/brew');
  console.log('2. brew install mongodb-community');
  console.log('3. brew services start mongodb/brew/mongodb-community');
  console.log('');
  console.log('Linux (Ubuntu):');
  console.log('1. wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -');
  console.log('2. echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list');
  console.log('3. sudo apt-get update && sudo apt-get install -y mongodb-org');
  console.log('4. sudo systemctl start mongod');
  console.log('');

  console.log('🐳 OPTION 3: Docker MongoDB');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('1. docker run -d -p 27017:27017 --name flicknet-mongo mongo:latest');
  console.log('2. MongoDB will be available at: mongodb://localhost:27017');
  console.log('');

  console.log('🧪 TESTING YOUR SETUP');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('After setting up MongoDB:');
  console.log('1. npm run seed          # Populate sample data');
  console.log('2. npm run server:dev    # Start the backend server');
  console.log('3. npm run test:api      # Test all API endpoints');
  console.log('4. npm run dev           # Start both frontend and backend');
  console.log('');

  console.log('🔧 TROUBLESHOOTING');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('If you get connection errors:');
  console.log('• Check if MongoDB service is running');
  console.log('• Verify the MONGODB_URI in your .env file');
  console.log('• For Atlas: check IP whitelist and credentials');
  console.log('• For local: ensure MongoDB is installed and started');
  console.log('');

  console.log('💡 QUICK START (Recommended)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('1. Use MongoDB Atlas (cloud) - it\'s free and easiest');
  console.log('2. Update .env with your connection string');
  console.log('3. Run: npm run seed');
  console.log('4. Run: npm run dev');
  console.log('');

  console.log('🎉 Once MongoDB is set up, your FlickNet backend will be fully functional!');
};

// Create a simple MongoDB Atlas connection string template
const createAtlasTemplate = () => {
  const envPath = path.join(__dirname, '../../.env');
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  if (!envContent.includes('# MongoDB Atlas Example')) {
    const atlasExample = `
# MongoDB Atlas Example (replace with your actual connection string)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/flicknet?retryWrites=true&w=majority
`;
    fs.appendFileSync(envPath, atlasExample);
    console.log('✅ Added MongoDB Atlas example to .env file');
  }
};

// Run the setup
if (require.main === module) {
  setupMongoDB();
  createAtlasTemplate();
}

module.exports = setupMongoDB;
