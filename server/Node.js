const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://daphnemarty:DaphneMarty1304%2E@mongodbcluster.hc3wm.mongodb.net/?retryWrites=true&w=majority';
const MONGODB_DB_NAME = 'admin'; // test with admin just to connect

async function testConnection() {
  try {
    console.log('⏳ Connecting...');
    const client = await MongoClient.connect(MONGODB_URI);
    const db = client.db(MONGODB_DB_NAME);
    console.log('✅ Connected to MongoDB:', db.databaseName);
    await client.close();
  } catch (err) {
    console.error('❌ Connection error:', err);
  }
}

testConnection();
