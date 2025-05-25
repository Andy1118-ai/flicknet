// MongoDB Atlas Connection Helper for FlickNet
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🌐 FlickNet MongoDB Atlas Setup Helper\n');

console.log('Please provide your MongoDB Atlas connection details:\n');

rl.question('1. Enter your MongoDB Atlas connection string: ', (connectionString) => {
  if (!connectionString.includes('mongodb+srv://')) {
    console.log('❌ Invalid connection string. It should start with mongodb+srv://');
    rl.close();
    return;
  }

  // Add /flicknet database name if not present
  let finalConnectionString = connectionString;
  if (!connectionString.includes('/flicknet')) {
    // Insert /flicknet before the query parameters
    if (connectionString.includes('?')) {
      finalConnectionString = connectionString.replace('?', '/flicknet?');
    } else {
      finalConnectionString = connectionString + '/flicknet';
    }
  }

  // Update .env file
  const envPath = path.join(__dirname, '.env');
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Replace the MONGODB_URI line
  const newEnvContent = envContent.replace(
    /MONGODB_URI=.*/,
    `MONGODB_URI=${finalConnectionString}`
  );

  fs.writeFileSync(envPath, newEnvContent);

  console.log('\n✅ Updated .env file with your MongoDB Atlas connection string!');
  console.log('\n🧪 Testing connection...\n');

  // Test the connection
  const mongoose = require('mongoose');
  
  mongoose.connect(finalConnectionString)
    .then(() => {
      console.log('🎉 SUCCESS! MongoDB Atlas connected successfully!');
      console.log('\n📋 Next steps:');
      console.log('1. Run: npm run seed');
      console.log('2. Run: npm run server:dev');
      console.log('3. Run: npm run test:api');
      console.log('4. Run: npm run dev');
      console.log('\n🚀 Your FlickNet backend is ready!');
      process.exit(0);
    })
    .catch(err => {
      console.log('❌ Connection failed:', err.message);
      console.log('\n🔧 Troubleshooting:');
      console.log('- Check your username and password');
      console.log('- Ensure IP address is whitelisted (0.0.0.0/0 for development)');
      console.log('- Verify the connection string is correct');
      process.exit(1);
    });

  rl.close();
});
