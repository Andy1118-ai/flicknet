require('dotenv').config();
const { MongoClient } = require('mongodb');

async function testConnection() {
  console.log('🔍 Testing MongoDB Atlas Connection...\n');
  
  const uri = process.env.MONGODB_URI;
  console.log('📋 Connection String:', uri.replace(/:[^:@]*@/, ':****@'));
  
  const client = new MongoClient(uri);
  
  try {
    console.log('🔌 Attempting to connect...');
    await client.connect();
    
    console.log('✅ Successfully connected to MongoDB Atlas!');
    
    // Test database operations
    const db = client.db('flicknet');
    const collections = await db.listCollections().toArray();
    
    console.log(`📊 Database: flicknet`);
    console.log(`📁 Collections found: ${collections.length}`);
    
    if (collections.length > 0) {
      console.log('📋 Collection names:');
      collections.forEach(col => console.log(`   - ${col.name}`));
    }
    
    // Test a simple operation
    const testCollection = db.collection('connection_test');
    const testDoc = { 
      message: 'Connection test successful', 
      timestamp: new Date(),
      from: 'FlickNet'
    };
    
    await testCollection.insertOne(testDoc);
    console.log('✅ Test document inserted successfully');
    
    await testCollection.deleteOne({ message: 'Connection test successful' });
    console.log('✅ Test document deleted successfully');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    if (error.message.includes('IP')) {
      console.log('\n💡 This looks like an IP whitelist issue!');
      console.log('🔧 To fix this:');
      console.log('   1. Go to https://cloud.mongodb.com/');
      console.log('   2. Navigate to Network Access');
      console.log('   3. Click "Add IP Address"');
      console.log('   4. Click "Add Current IP Address"');
      console.log('   5. Wait 1-2 minutes for changes to apply');
    } else if (error.message.includes('authentication')) {
      console.log('\n💡 This looks like an authentication issue!');
      console.log('🔧 Check your username and password in the connection string');
    } else {
      console.log('\n💡 Other possible issues:');
      console.log('   - Check your internet connection');
      console.log('   - Verify the cluster name and region');
      console.log('   - Make sure the database user exists');
    }
  } finally {
    await client.close();
    console.log('\n🔌 Connection closed');
  }
}

testConnection();
