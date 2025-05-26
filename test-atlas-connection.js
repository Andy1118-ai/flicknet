require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

// Use the connection string from environment variables
const uri = process.env.MONGODB_URI;

console.log('🔍 Testing MongoDB Atlas Connection with your exact code...\n');
console.log('📋 Connection String:', uri.replace(/:[^:@]*@/, ':****@'));

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    console.log('🔌 Connecting to MongoDB Atlas...');
    
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();
    
    console.log('✅ Connected successfully!');
    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("🏓 Pinged your deployment. You successfully connected to MongoDB!");
    
    // Test FlickNet database
    const db = client.db("flicknet");
    const collections = await db.listCollections().toArray();
    
    console.log(`\n📊 FlickNet Database Info:`);
    console.log(`📁 Collections found: ${collections.length}`);
    
    if (collections.length > 0) {
      console.log('📋 Collection names:');
      collections.forEach(col => console.log(`   - ${col.name}`));
    } else {
      console.log('📝 No collections found - database is empty (this is normal for new setups)');
    }
    
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
    } else if (error.message.includes('ETIMEDOUT')) {
      console.log('\n💡 Connection timeout - likely IP whitelist issue!');
      console.log('🔧 Make sure your IP is whitelisted in MongoDB Atlas Network Access');
    }
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
    console.log('\n🔌 Connection closed');
  }
}

run().catch(console.dir);
